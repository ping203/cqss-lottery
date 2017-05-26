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
	var player = pomelo.app.areaService.getPlayer(session.get('playerId'));
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
        //todo:检查平台类型投注总额是否超限
        if(!msg.betData){
            next(new Error(Code.PARAMERROR.desc, Code.PARAMERROR.code), new Answer.NoDataResponse(Code.PARAMERROR));
            return;
        }

		this.betParser.parse(msg.betData, function (err, result) {
			if(err){
                next(new Error(err.desc, err.code), new Answer.NoDataResponse(err));
                return;
			}

            for(var type in result.typeTotal){
                // 平台限额检查
                var err = pomelo.app.areaService.canBetPlatform(type, result.typeTotal[type]);
                if(err){
                    next(new Error(err.desc, err.code), new Answer.NoDataResponse(err));
                    return;
                }

                //玩家限额检查
                err = player.canBet(type, result.typeTotal[type])
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
		{name:'betParser', ref:'betParser'}
	]
};