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
    this.lastTickCount = 0;
    this.tickPeriod = 0;
    this.lastTickTime = 0;
    this.lastLottery = null; //最近开奖
    this.nextLottery = null; //下期彩票
    this.preLottery = null; //上期开奖
    this.identify = null; //彩票标志
    this.lotteryCaches = [];
}

Lottery.prototype.init = function() {
	this.type = this.consts.EntityType.LOTTERY;
	var Entity = bearcat.getFunction('entity');
	Entity.call(this, this.opts);
	this._init();

	var self = this;
    this.daoLottery.getLotterys(0,20,function (err, results) {
        if(!err && results.length >= 1){
            self.lotteryCaches = results;
        }
    });
};

// proof tick timer
Lottery.prototype.setTickCount = function(period, tick) {
 //   this.tickPeriod = period;
    this.tickCount = tick;
    this.lastTickTime = Date.now();
};

Lottery.prototype.publishNotice = function () {
    this.emit(this.consts.Event.area.notice, {lottery: this, content:this.sysConfig.getSysNotice()});
};

Lottery.prototype.publishLottery = function (result) {
    this.lastLottery = result.last;
    this.nextLottery = result.next;
    this.preLottery = result.pre;
    this.identify = result.identify;
    this.tickPeriod = result.next.period;
    this.emit(this.consts.Event.area.lottery, {lottery: this, lotteryResult:this.lastLottery, preLottery:this.preLottery, uids:null});
};

//发布最近一期开奖信息
Lottery.prototype.publishCurLottery = function (uids) {
	if(this.lastLottery){
        this.emit(this.consts.Event.area.lottery, {lottery: this, lotteryResult:this.lastLottery, preLottery:this.preLottery, uids:uids});
	}
};

//发布开奖分析结果
Lottery.prototype.publishParseResult = function (parseResult) {
    var self = this;
    this.daoLottery.addLottery(this.identify, this.lastLottery.period, this.lastLottery.numbers,
        Date.parse(this.lastLottery.opentime), JSON.stringify(parseResult),
    function (err, result) {
        if(!err && !!result){
            if(self.lotteryCaches.push(result) > 10){
                self.lotteryCaches.shift();
            }
            self.emit(self.consts.Event.area.parseLottery, {lottery: self, parseResult:[result], uids:null});
        }
    });
};

//发布最近10期开奖分析结果
Lottery.prototype.initPublishParseResult = function (uids) {
    this.emit(this.consts.Event.area.parseLottery, {lottery: this, parseResult:this.lotteryCaches, uids:uids});
};

//发布最近10条投注记录
Lottery.prototype.initPublishLatestBets = function (betItems, uids) {
    this.emit(this.consts.Event.area.playerBets, {lottery: this, betItems:betItems, uids:uids});
};

Lottery.prototype.getNextPeriod = function () {
    return this.nextLottery.period;
}

Lottery.prototype.getIdentify = function () {
    return this.identify;
}

Lottery.prototype.getLotterys = function (skip, limit, cb) {
    this.daoLottery.getLotterys(skip,limit,function (err, results) {
        if(!err && results.length >= 1){
            this.lotteryCaches = results;
        }
    });
}

Lottery.prototype.getTickCount = function () {
    return this.tickCount;
};

Lottery.prototype.countdown = function () {
	var subTick = 0;
	if(this.lastTickTime != 0){
        subTick = (Date.now() - this.lastTickTime)/1000;
	}

	var temp = this.tickCount;
    this.tickCount -= subTick;

	if(this.tickCount < 0) this.tickCount = 0;

	if(Math.floor(this.tickCount) > this.lastTickCount && this.lastTickCount != 0){
        this.tickCount = this.lastTickCount;
    }

    this.emit(this.consts.Event.area.countdown, {lottery: this});

    this.lastTickTime = Date.now();

    this.lastTickCount = this.tickCount;
};


Lottery.prototype.getWeiXin = function () {
    return this.sysConfig.getGM();
}

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

Lottery.prototype.toJSON = function () {
    var r = this._toJSON();

    //  r['id'] = this.id;
    r['type'] = this.type;

    return r;
};

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
    },{
	    name:"sysConfig",
        ref:"sysConfig"
    }]
};