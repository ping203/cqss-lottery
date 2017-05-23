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
		//parse bet info, check bet info is valid.
		this.betParser.parse(msg.betData, function (err, result) {
			if(err){
                next(new Error(Code.GAME.FA_BETINFO_INVALID.desc, Code.GAME.FA_BETINFO_INVALID.code));
                return;
			}
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