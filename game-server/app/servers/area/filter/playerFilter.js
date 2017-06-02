var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Code = require('../../../../../shared/code');
var Answer = require('../../../../../shared/answer');

var PlayerFilter = function() {
};

/**
 * Area filter
 */
PlayerFilter.prototype.before = function(msg, session, next){
	var player = pomelo.app.areaService.getPlayer(session.uid);
    var route = msg.__route__;

	if(!player){
		if(route.search(/enterGame$/) >= 0){
			next();
			return;
		}else{
            next(new Error(Code.GAME.FA_PLAYER_NOT_FOUND.desc, Code.GAME.FA_PLAYER_NOT_FOUND.code), new Answer.NoDataResponse(Code.FA_PLAYER_NOT_FOUND));
			return;
		}
	}

	if(route.match(/.bet$/)){

	    if(!pomelo.app.areaService.canBetNow()){
            next(new Error(Code.GAME.FA_BET_CHANNEL_CLOSE.desc, Code.GAME.FA_BET_CHANNEL_CLOSE.code), new Answer.NoDataResponse(Code.GAME.FA_BET_CHANNEL_CLOSE));
            return;
        }

        //todo:检查平台类型投注总额是否超限
        if(!msg.betData){
            next(new Error(Code.PARAMERROR.desc, Code.PARAMERROR.code), new Answer.NoDataResponse(Code.PARAMERROR));
            return;
        }

        var self = this;
		this.betParser.parse(msg.betData, function (err, result) {
			if(err){
                next(new Error(err.desc, err.code), new Answer.NoDataResponse(err));
                return;
			}

            for(var type in result.betTypeInfo){
                // 平台限额检查
                var answer = self.platformBet.canBet(result.betTypeInfo[type].type.code, result.betTypeInfo[type].money);
                if(answer.result.code != Code.OK.code){
                    next(new Error(err.desc, err.code), answer);
                    return;
                }
                result.betTypeInfo[type].freeBetValue = answer.data.freeBetValue;

                //玩家限额检查
                err = player.canBet(result.betTypeInfo[type].type.code, result.betTypeInfo[type].money)
                if(err){
                    next(new Error(err.desc, err.code), new Answer.NoDataResponse(err));
                    return;
                }
            }

            // 玩家限额检查

            msg.betParseInfo = result;
			next();
        });
	}
	else {
		next();
	}
};

module.exports = {
    id:"playerFilter",
	func:PlayerFilter,
	props:[
		{name:'betParser', ref:'betParser'},
		{name:'platformBet', ref:'platformBet'}
	]
};