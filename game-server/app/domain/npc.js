var bearcat = require('bearcat');
var util = require('util');

/**
 * Initialize a new 'Treasure' with the given 'opts'.
 * Item inherits Entity
 *
 * @param {Object} opts
 * @api public
 */

function NPC(opts) {
    this.opts = opts;
    this.type = null;
    this.imgId = opts.imgId;
    this.consts = null;
}

NPC.prototype.init = function() {
	this.type = this.consts.EntityType.NPC;
	var Entity = bearcat.getFunction('entity');
	Entity.call(this, this.opts);
	this._init();
};

NPC.prototype.publishNotice = function () {
    this.emit(this.consts.Event.area.notice, {npc: this});
};

NPC.prototype.publishLottery = function () {
    this.emit(this.consts.Event.area.lottery, {npc: this});
};

NPC.prototype.countdown = function () {
    this.emit(this.consts.Event.area.countdown, {npc: this});
};

NPC.prototype.toJSON = function() {
	var r = this._toJSON();
	r['type'] = this.type;
	r['imgId'] = this.imgId;
	r['score'] = this.score;

	return r;
}

module.exports = {
	id: "npc",
	func: NPC,
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