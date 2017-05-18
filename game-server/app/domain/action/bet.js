/**
 * Created by linyng on 17-5-17.
 */

var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'Move');
var bearcat = require('bearcat');
var util = require('util');

// Move action, which is used to preserve and update user position
var Bet = function(opts) {
    this.opts = opts;
    opts.type = 'bet';
    opts.id = opts.entity.entityId;
    opts.singleton = true;

    this.time = Date.now();
    this.entity = opts.entity;
    this.betInfo = opts.betInfo;
};

Bet.prototype.init = function() {
    var Action = bearcat.getFunction('action');
    Action.call(this, this.opts);
}

Bet.prototype.update = function() {

    this.entity.emit(this.consts.Event.area.playerBet, {
        entityId: this.entity.entityId,
        betInfo: betInfo
    });
};

function getDis(pos1, pos2) {
    return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
}

function getPos(start, end, moveLength, dis) {
    if (!dis) {
        dis = getDis(start, end);
    }
    var pos = {};

    pos.x = start.x + (end.x - start.x) * (moveLength / dis);
    pos.y = start.y + (end.y - start.y) * (moveLength / dis);

    return pos;
}

module.exports = {
    id: "bet",
    func: Bet,
    args: [{
        name: "opts",
        type: "Object"
    }],
    scope: "prototype",
    parent: "action",
    init: "init",
    props:[
        {name: "consts",ref: "consts"}
    ]
};