
var logger = require('pomelo-logger').getLogger(__filename);

var PlayerEvent = function () {

};

/**
 * Handle player event
 */
PlayerEvent.prototype.addEventForPlayer = function (player){

	var self = this;

    player.on(this.consts.Event.area.playerBet, function(args) {
        var player = self.getEntity(args.entityId);
        if (player) {
            player.addScore(treasure.score);
            player.areaService.removeEntity(args.target);
            player.areaService.getChannel().pushMessage({
                route: self.consts.Event.area.playerBet,
                entityId: args.entityId,
                target: args.target,
                score: treasure.score
            });
        }
    });

    player.on(this.consts.Event.area.playerUnBet, function(args) {
        var player = self.areaService.getEntity(args.entityId);
        if (player) {
            player.addScore(treasure.score);
            player.areaService.removeEntity(args.target);
            player.areaService.getChannel().pushMessage({
                route: self.consts.Event.area.playerUnBet,
                entityId: args.entityId,
                target: args.target,
                score: treasure.score
            });
        }
    });

	/**
	 * Handler upgrade event for player, the message will be pushed only to the one who upgrade
	 */
	player.on(this.consts.Event.area.playerUpgrade, function() {
		logger.debug('event.onUpgrade: ' + player.level + ' id: ' + player.id);
		var uid = {uid:player.userId, sid : player.serverId};
		//this.messageService.pushMessageToPlayer(uid, 'onUpgrade', player.strip());
	});
};

module.exports = {
	id:"playerEvent",
	func:PlayerEvent,
	props:[
		{name:"consts",ref:"consts"}
	]

}