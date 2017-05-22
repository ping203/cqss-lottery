/**
 * Created by linyng on 17-5-17.
 */

var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'Move');
var bearcat = require('bearcat');
var util = require('util');

// Move action, which is used to preserve and update user position
var UnBet = function(opts) {
    this.opts = opts;
    opts.type = 'unBet';
    this.entity = opts.entity;
    opts.id = opts.entity.entityId;
    opts.singleton = false;
    this.betRecord = opts.betRecord;//{period:'20170519054',time:143432432423423,info:'5/2/100'}
};

UnBet.prototype.init = function() {
    var Action = bearcat.getFunction('action');
    Action.call(this, this.opts);
}

UnBet.prototype.update = function() {
    this.entity.emit(this.consts.Event.area.playerBet, {
        entityId: this.entity.entityId,
        betRecord: this.betRecord
    });
};

module.exports = {
    id: "unBet",
    func: UnBet,
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