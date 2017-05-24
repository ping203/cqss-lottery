
var logger = require('pomelo-logger').getLogger(__filename);

var PlayerEvent = function () {

};

/**
 * Handle player event
 */
PlayerEvent.prototype.addEventForPlayer = function (player){
    var self = this;
    player.on(this.consts.Event.area.playerBet, function(args) {
        var player = args.player;
        if (player) {
            player.areaService.getChannel().pushMessage(self.consts.Event.area.playerBet,{
                entityId: args.entityId,
                betInfo: args.betInfo
            });
        }
    });

    player.on(this.consts.Event.area.playerUnBet, function(args) {
        var player = args.player;
        if (player) {
            player.areaService.getChannel().pushMessage(self.consts.Event.area.playerUnBet,{
                entityId: args.entityId,
                betRecord: args.betRecord
            });
        }
    });

    player.on(this.consts.Event.area.playerRename, function(args) {
        var player = args.player;
        if (player) {
            player.areaService.getChannel().pushMessage(self.consts.Event.area.playerRename,{
                entityId: args.entityId,
                roleName: args.roleName
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