
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
            self.areaService.removeEntity(args.target);
            self.areaService.getChannel().pushMessage({
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
            self.areaService.removeEntity(args.target);
            self.areaService.getChannel().pushMessage({
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
	player.on('upgrade', function() {
		logger.debug('event.onUpgrade: ' + player.level + ' id: ' + player.id);
		var uid = {uid:player.userId, sid : player.serverId};
		this.messageService.pushMessageToPlayer(uid, 'onUpgrade', player.strip());
	});

	/**
	 * Handle pick item event for player, it will invoked when player pick item success
	 */
	player.on('pickItem', function(args){
		if(args.result !== consts.Pick.SUCCESS){
			logger.debug('Pick Item error! Result : ' + args.result);
			return;
		}

		var item = args.item;
		var player = args.player;

		player.area.removeEntity(item.entityId);
        this.messageService.pushMessageByAOI(player.area, {route: 'onPickItem', player: player.entityId, item: item.entityId, index: args.index}, {x: item.x, y: item.y});
	});
};

module.exports = {
	id:"playerEvent",
	func:PlayerEvent,
	props:[
		{name:"consts",ref:"consts"},
		{name:"areaService",ref:"areaService"}
	]

}