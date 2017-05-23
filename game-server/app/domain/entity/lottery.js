var bearcat = require('bearcat');
var util = require('util');

/**
 * Initialize a new 'Treasure' with the given 'opts'.
 * Item inherits Entity
 *
 * @param {Object} opts
 * @api public
 */

function Lottery(opts) {
    this.opts = opts;
    this.imgId = opts.imgId;
    this.consts = null;
    this.tickCount = 0;
    this.tickPeriod = 0;
    this.lastTickTime = 0;
    this.lastLottery = null; //最近开奖
    this.nextLottery = null; //下期彩票
    this.identify = null; //彩票标志
    this.lotteryHistory = new Map();
}

Lottery.prototype.init = function() {
	this.type = this.consts.EntityType.LOTTERY;
	var Entity = bearcat.getFunction('entity');
	Entity.call(this, this.opts);
	this._init();
};

// proof tick timer
Lottery.prototype.setTickCount = function(period, tick) {
    this.tickPeriod = period;
    this.tickCount = tick;
};

Lottery.prototype.publishNotice = function () {
    this.emit(this.consts.Event.area.notice, {lottery: this});
};

Lottery.prototype.publishLottery = function (result) {
    this.lastLottery = result.last;
    this.nextLottery = result.next;
    this.identify = result.identify;
    this.lotteryHistory.set(result.last.period, result.last);
    this.daoLottery.recordLottery(this.lastLottery);
    this.emit(this.consts.Event.area.lottery, {lottery: this, lotteryResult:this.lastLottery, uids:null});
};

Lottery.prototype.publishCurLottery = function (uids) {
	if(this.lastLottery){
        this.emit(this.consts.Event.area.lottery, {lottery: this, lotteryResult:this.lastLottery, uids:uids});
	}
};

Lottery.prototype.getNextPeriod = function () {
    return this.nextLottery.period;
}

Lottery.prototype.getIdentify = function () {
    return this.identify;
}

Lottery.prototype.getLotterys = function (skip, limit, cb) {

}

Lottery.prototype.countdown = function () {
	var subTick = 0;
	if(this.lastTickTime != 0){
        subTick = (Date.now() - this.lastTickTime)/1000;
	}
    this.tickCount -= subTick;
	if(this.tickCount < 0) this.tickCount = 0;

    this.emit(this.consts.Event.area.countdown, {lottery: this});

    this.lastTickTime = Date.now();
};


Lottery.prototype.save = function() {
    this.emit('save');
};

Lottery.prototype.strip = function() {
    var r= {
        id: this.id,
        entityId: this.entityId,
        kindId: this.kindId,
        kindName: this.kindName,
        areaId: this.areaId,
        type: this.type
    };

    return r;
}

module.exports = {
	id: "lottery",
	func: Lottery,
	scope: "prototype",
	parent: "entity",
	init: "init",
	args: [{
		name: "opts",
		type: "Object"
	}],
	props: [{
		name: "consts",
		ref: "consts"
	},{
	    name:"daoLottery",
        ref:"daoLottery"
    }]
};