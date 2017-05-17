var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

var PlayerFilter = function() {
};

/**
 * Area filter
 */
PlayerFilter.prototype.before = function(msg, session, next){
	var player = pomelo.app.areaService.getPlayer(session.get('playerId'));
	if(!player){
		var route = msg.__route__;

		if(route.search(/^area\.resourceHandler/i) == 0 || route.search(/enterScene$/i) >= 0){
			next();
			return;
		}else{
			next(new Error('No player exist!'));
			return;
		}
	}

	if(player.died){
		next(new Error("You can't move a dead man!!!"));
		return;
	}

	next();
};

module.exports = {
    id:"playerFilter",
	func:PlayerFilter
};