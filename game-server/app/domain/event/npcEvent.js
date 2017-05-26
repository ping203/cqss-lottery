var pomelo = require('pomelo');

var NpcEvent = function () {

};

/**
 * Handler lottery event
 */
NpcEvent.prototype.addEventForNPC = function (lottery){
    var self = this;
    /**
     * Publish the lottery tick free seconds.
     */
	lottery.on(this.consts.Event.area.countdown, function (args) {
      //  var lottery = self.getEntity(args.entityId);
        if (args.lottery) {
            args.lottery.areaService.getChannel().pushMessage(self.consts.Event.area.countdown,{
                entityId: args.lottery.entityId,
                tickCount: Math.floor(args.lottery.tickCount),
                period:args.lottery.tickPeriod
            });
        }
    });

    /**
     * Publish the lottery result
     */
	lottery.on(this.consts.Event.area.lottery, function (args) {
        if (args.lottery) {
            if(args.uids){
                pomelo.app.get('channelService').pushMessageByUids(self.consts.Event.area.lottery,{
                    entityId: args.entityId,
                    lotteryResult: args.lotteryResult,
                },args.uids);
            }else {
                args.lottery.areaService.getChannel().pushMessage(self.consts.Event.area.lottery,{
                    entityId: args.entityId,
                    lotteryResult: args.lotteryResult,
                });
            }
        }
    });

	/**
	 * Publish notice
	 */
	lottery.on(this.consts.Event.area.notice, function(data){
        var lottery = self.getEntity(args.entityId);
        if (lottery) {
            lottery.areaService.getChannel().pushMessage(self.consts.Event.area.notice,{
                entityId: args.entityId,
                lotteryResult: args.lotteryResult,
            });
        }
	});
};

module.exports ={
	id:"npcEvent",
	func:NpcEvent,
	props:[
		{name:"consts", ref:"consts"}
	]
}