var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var Code = require('../../../../../shared/code');

var PlayerFilter = function() {
};

/**
 * Area filter
 */
PlayerFilter.prototype.before = function(msg, session, next){
	var player = pomelo.app.areaService.getPlayer(session.get('playerId'));
    var route = msg.__route__;

	if(!player){
		if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterGame$/i) >= 0){
			next();
			return;
		}else{
            next(new Error(Code.GAME.FA_PLAYER_NOT_FOUND.desc, Code.GAME.FA_PLAYER_NOT_FOUND.code));
			return;
		}
	}

	if(route.search(/bet$/i)){
        //todo:检查平台类型投注总额是否超限
        if(!msg.betData){
            next(new Error(Code.PARAMERROR.desc, Code.PARAMERROR.code), Code.PARAMERROR);
            return;
        }

		this.betParser.parse(msg.betData, function (err, result) {
			if(err){
                next(new Error(err.desc, err.code));
                return;
			}

            var err;
            for(var type in result.typeTotal){
                // 平台限额检查
                if(!this.areaService.canBetPlatform(type, result.typeTotal[type], err)){
                    cb(err, null);
                    return;
                }

                //玩家限额检查
                if(!player.canBet(type, result.typeTotal[type], err)){
                    cb(err, null);
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