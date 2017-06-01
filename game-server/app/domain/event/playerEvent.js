
var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var PlayerEvent = function () {

};

PlayerEvent.prototype.addEventForPlayer = function (player){
    var self = this;
    player.on(this.consts.Event.area.playerBet, function(args) {
        var player = args.player;
        if (player) {
            var betItem = args.betItem.strip();
            player.areaService.getChannel().pushMessage(self.consts.Event.area.playerBet,{
                entityId:player.entityId,
                betItem: betItem
            });
        }
    });

    player.on(this.consts.Event.area.playerUnBet, function(args) {
        var player = args.player;
        if (player) {
            var betItem = args.betItem.strip();
            player.areaService.getChannel().pushMessage(self.consts.Event.area.playerUnBet,{
                entityId:player.entityId,
                betItem: betItem
            });
        }
    });

    player.on(this.consts.Event.area.playerChange, function(args) {
        var player = args.player;
        if (player) {
            if(args.uids){
                pomelo.app.get('channelService').pushMessageByUids(self.consts.Event.area.playerChange,{
                    entityId:player.entityId,
                    player: player.strip()
                },args.uids);
            }else {
                args.lottery.areaService.getChannel().pushMessage(self.consts.Event.area.playerChange,{
                    entityId:player.entityId,
                    player: player.strip()
                });
            }
        }
    });

    player.on(this.consts.Event.area.playerWinner, function(args) {
        var player = args.player;
        if (player) {
            if(args.uids){
                pomelo.app.get('channelService').pushMessageByUids(self.consts.Event.area.playerWinner,{
                    entityId:player.entityId,
                    winMoney: args.winMoney
                },args.uids);
            }else {
                args.lottery.areaService.getChannel().pushMessage(self.consts.Event.area.playerWinner,{
                    entityId:player.entityId,
                    winMoney: args.winMoney
                });
            }
        }
    });
};

module.exports = {
	id:"playerEvent",
	func:PlayerEvent,
	props:[
		{name:"consts",ref:"consts"}
	]

}