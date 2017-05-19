/**
 * Created by linyng on 2017/5/19.
 */


var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'Move');
var bearcat = require('bearcat');
var util = require('util');

// Move action, which is used to preserve and update user position
var Rename = function(opts) {
    this.opts = opts;
    opts.type = 'rename';
    opts.id = opts.entity.entityId;
    opts.singleton = true;
    this.roleName = opts.roleName;
};

Rename.prototype.init = function() {
    var Action = bearcat.getFunction('action');
    Action.call(this, this.opts);
}

Rename.prototype.update = function() {
    this.entity.emit(this.consts.Event.area.playerBet, {
        entityId: this.entity.entityId,
        roleName: this.roleName
    });
};

module.exports = {
    id: "rename",
    func: Rename,
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