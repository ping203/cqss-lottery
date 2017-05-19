var api = require('../../util/dataApi');

var NpcEvent = function () {

};

/**
 * Handler npc event
 */
NpcEvent.prototype.addEventForNPC = function (npc){
    var self = this;
    /**
     * Publish the lottery tick free seconds.
     */
	npc.on(this.consts.Event.area.countdown, function (data) {
        var npc = self.getEntity(args.entityId);
        if (npc) {
            npc.areaService.getChannel().pushMessage({
                route: self.consts.Event.area.countdown,
                entityId: args.entityId,
                tick: args.tick
            });
        }
    });

    /**
     * Publish the lottery result
     */
	npc.on(this.consts.Event.area.lottery, function (data) {
        var npc = self.getEntity(args.entityId);
        if (npc) {
            npc.areaService.getChannel().pushMessage({
                route: self.consts.Event.area.lottery,
                entityId: args.entityId,
                lotteryResult: args.lotteryResult,
            });
        }
    });

	/**
	 * Publish notice
	 */
	npc.on(this.consts.Event.area.notice, function(data){
        var npc = self.getEntity(args.entityId);
        if (npc) {
            npc.areaService.getChannel().pushMessage({
                route: self.consts.Event.area.notice,
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
