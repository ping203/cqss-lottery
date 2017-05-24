/**
 * Created by linyng on 17-5-22.
 */

var bearcat = require('bearcat');
var util = require('util');

var BetItem = function (opts) {
    this.opts = opts;
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.period = opts.period;
    this.identify = opts.identify;
    this.betInfo = opts.betInfo;
    this.state = opts.state;
    this.investmentMoney = opts.investmentMoney;
    this.multiple = opts.multiple;
    this.harvestMoney = opts.harvestMoney;
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

BetItem.prototype.getIncomValue = function (openInfo, item) {
    var inc = 0;
    var multi = this.income.getMultiple(item.type.code);
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

    return inc;

};


BetItem.prototype.calcHarvest = function (openInfo) {
    for (var item of this.betItems) {
        this.harvestMoney += this.getIncomValue(openInfo, item);
    }
};

BetItem.prototype.toJSON = function () {
    var r = this._toJSON();

    //  r['id'] = this.id;
    r['type'] = this.type;

    return r;
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
        {name: 'income', ref: 'income'},
        {name: 'consts', ref: 'consts'}
    ]
}