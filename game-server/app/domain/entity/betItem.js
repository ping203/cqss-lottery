/**
 * Created by linyng on 17-5-22.
 */

var bearcat = require('bearcat');
var util = require('util');
var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'BetItem');

var BetItem = function (opts) {
    this.opts = opts;
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.period = opts.period;
    this.identify = opts.identify;
    this.betInfo = opts.betInfo;
    this.state = opts.state;
    this.betCount = opts.betCount;
    this.winCount = opts.winCount;
    this.betMoney = opts.betMoney;
    this.winMoney = opts.winMoney;
    this.betTime = Date.now();
    this.betParseInfo = null;
    this.betItems = null;
};

BetItem.prototype.init = function () {
    this.type = this.consts.EntityType.ITEM;
    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();
};

BetItem.prototype.getState = function () {
    return this.state;
};

BetItem.prototype.setState = function (state) {
    this.state = state;
};

BetItem.prototype.setBetItems = function (betItems) {
    this.betItems = betItems;
};

// 获取本金
BetItem.prototype.getBetMoney = function () {
    return this.betMoney;
};

//获取投注柱数
BetItem.prototype.getBetCount = function () {
    return this.betCount;
};

//获取中奖金额
BetItem.prototype.getWinMoney = function () {
    return this.winMoney;
};
//获取中奖柱数
BetItem.prototype.getWinCount = function () {
    return this.winCount;
};

//计算一柱中奖收益
BetItem.prototype.getIncomValue = function (openInfo, item) {
    var inc = 0;
    var multi = this.incomeCfg.getBetRate(item.type.code);
    switch (item.type.code) {
        case this.consts.BetType.TotalSize.code:
            if(openInfo.totalSizeResult === item.result){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.TotalSingleDouble.code:
            if(openInfo.totalSingleDoubleResult === item.result){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.DragonAndTiger.code:
            if(openInfo.dragonAndTigerResult === item.result){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.Equal15.code:
            if(openInfo.equal15Result === item.result){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.PerPosSizeSingleDouble.code:
            if(openInfo.perPosSizeSingleDoubleResult.has(item.result)){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.PerPosValue.code:
            if(openInfo.perPosValueResult.has(item.result)){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.ContainValue.code:
            if(openInfo.containValueResult.has(item.result)){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.Panther.code:
            if(openInfo.pantherResult.has(item.result)){
                inc = item.money * multi;
            }
            break;
        case this.consts.BetType.ShunZi.code:
            if(openInfo.shunZiResult.has(item.result)){
                inc = item.money * multi;
            }
            break;
        default:
            break;
    }

    if(inc > 0) this.winCount++;

    return inc;

};

BetItem.prototype.calcHarvest = function (openInfo) {
    for (var item of this.betItems) {
        this.winMoney += this.getIncomValue(openInfo, item);
    }
};

BetItem.prototype.strip = function () {
    var r= {
        id: this.id,
        entityId:this.entityId,
        type:this.type,
        playerId: this.playerId,
        period: this.period,
        identify: this.identify,
        betInfo: this.betInfo,
        state: this.state,
        betCount: this.betCount,
        winCount: this.winCount,
        betMoney:this.betMoney,
        winMoney:this.winMoney,
        betTime: this.betTime
    };

    return r;
};

BetItem.prototype.toJSON = function () {
    var r = this._toJSON();

    //  r['id'] = this.id;
    r['type'] = this.type;

    return r;
};

// Emit the event 'save'.
BetItem.prototype.save = function () {
    this.emit('save');
};

module.exports = {
    id: "betItem",
    func: BetItem,
    init: "init",
    scope: "prototype",
    parent: "entity",
    args: [{
        name: "opts",
        type: "Object"
    }],
    props: [
        {name: 'betParser', ref: 'betParser'},
        {name: 'incomeCfg', ref: 'incomeCfg'},
        {name: 'consts', ref: 'consts'}
    ]
}