/**
 * Created by linyng on 17-5-22.
 */


var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');
var Code = require('../../../shared/code');

function Bets(opts) {
    this.opts = opts;
    // this.id = opts.id;
    this.id = 1;
    this.betMap = new Map();
};

Bets.prototype.init = function () {
    this.type = this.consts.EntityType.BETS;
    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();
};

Bets.prototype.addItem = function (item) {
    this.betMap.set(item.entityId, item);
    this.eventManager.addEvent(item);
};

Bets.prototype.getItem = function (entityId) {
    return this.betMap.get(entityId);
};

Bets.prototype.openLottery = function (openInfo, level) {
    var openResult = {winCount:0,winMoney:0};
    for (var item of this.betMap.values()) {
        if (item.getState() === this.consts.BetState.BET_WAIT) {
            item.calcHarvest(openInfo, level);
            item.setState(this.consts.BetState.BET_OPENNED);
            item.save();
            openResult.winCount += item.getWinCount();
            openResult.winMoney += item.getWinMoney();
            //this.syncItems.push(item);
        }
    }
    this.betMap.clear();

    return openResult;
};

//Get all the items
Bets.prototype.all = function () {
    return this.betMap;
};

Bets.prototype.toJSON = function () {
    var r = this._toJSON();

    //  r['id'] = this.id;
    r['type'] = this.type;

    return r;
};

module.exports = {
    id: "bets",
    func: Bets,
    scope: "prototype",
    parent: "entity",
    init: "init",
    args: [{
        name: "opts",
        type: "Object"
    }],
    props: [
        {name: "consts", ref: "consts"},
        {name: "eventManager", ref: "eventManager"},
    ]
};