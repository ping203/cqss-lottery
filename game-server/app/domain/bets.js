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
    this.syncItems = [];
    this.typeTotal = new Map();
};

Bets.prototype.init = function () {
    this.type = this.consts.EntityType.BETS;
    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();
};

Bets.prototype.getData = function () {
    var data = {};

    data.id = this.id;

    for (let [id, value] of this.betMap) {

    }

    data.itemCount = this.betMap.size;

    return data;
};

Bets.prototype.addItem = function (item) {
    this.betMap.set(item.entityId, item);
    this.eventManager.addEvent(item);
};

Bets.prototype.getItem = function (entityId) {
    return this.betMap.get(entityId);
};

// 0 确认，1 撤销，2 结算,3未开奖
Bets.prototype.setItemState = function (entityId, state) {
    var item = this.betMap.get(entityId);
    if (item) {
        item.setState(state);
        //this.syncItems.push(item);
        item.save();
    }
};

Bets.prototype.openLottery = function (openInfo) {

    var openResult = {harvestMultiple:0,harvestMoney:0};
    for (var item of this.betMap.values()) {
        if (item.getState() === this.consts.BetState.BET_WAIT) {
            item.calcHarvest(openInfo);
            item.setState(this.consts.BetState.BET_OPENNED);
            item.save();
            openResult.harvestMultiple += item.getHarvestMultiple();
            openResult.harvestMoney += item.getHarvestMoney();
            //this.syncItems.push(item);
        }
    }
    // this.save();
    this.betMap.clear();

    return openResult;
};

Bets.prototype.getSyncItems = function () {
    return this.syncItems;
};

//Get all the items
Bets.prototype.all = function () {
    return this.betMap;
};


Bets.prototype.canBetType = function (type, value) {
    var betted = this.typeTotal.get(type);
    var num = !!betted ? betted : 0;
    var err = {};
    if (this.betLimit.playerLimit(type, num + value)) {
        err.code = Code.GAME.FA_BET_PLAYER_LIMIT.code;
        err.desc = Code.GAME.FA_BET_PLAYER_LIMIT.desc + '最多还能下注' + this.betLimit.getPlayerValue(type);
    } else {
        err = null;
    }

    return err;
}

// Emit the event 'save'.
Bets.prototype.save = function () {
    this.emit('save');
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
        {name: "betLimit", ref: "betLimit"},
        {name: "eventManager", ref: "eventManager"},
    ]
};