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
    this.entity = opts.entity;
    opts.id = opts.entity.entityId;
    opts.singleton = false;
    this.betInfo = opts.betInfo;//{period:'20170519054',time:143432432423423,info:'5/2/100'}

};

Bet.prototype.init = function() {
    var Action = bearcat.getFunction('action');
    Action.call(this, this.opts);
}

Bet.prototype.update = function() {

    this.entity.emit(this.consts.Event.area.playerBet, {
        entityId: this.entity.entityId,
        betRecord: this.betRecord
    });
};

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