/**
 * Created by linyng on 17-5-22.
 */


var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');

function Bets(opts) {
    this.opts = opts;
    this.id = opts.id;
    this.betMap = new Map();
    this.syncItems = [];
};

Bets.prototype.init = function() {
    this.type = this.consts.EntityType.BETS;
    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();
};

Bets.prototype.get = function(id) {
    return this.betMap.get(id);
};

Bets.prototype.getData = function() {
    var data = {};

    data.id = this.id;

    for(let [id, value] of this.betMap){

    }

    data.itemCount = this.betMap.size;

    return data;
};

Bets.prototype.addItem = function(item) {
    this.betMap.set(item.id, item);
};

Bets.prototype.setItemState = function(id, state) {
    var item = this.betMap.get(id);
    if(item){
        item.state = state;
        this.syncItems.push(item);
        this.save();
    }
};

Bets.prototype.getSyncItems = function(){
    return this.syncItems;
}

//Get all the items
Bets.prototype.all = function() {
    return this.betMap;
};

// Emit the event 'save'.
Bets.prototype.save = function () {
    this.emit('save');
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
    props: [{
        name: "consts",
        ref: "consts"
    }]
};