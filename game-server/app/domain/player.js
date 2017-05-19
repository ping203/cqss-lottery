var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');

/**
 * Initialize a new 'Player' with the given 'opts'.
 * Player inherits Character
 *
 * @param {Object} opts
 * @api public
 */

function Player(opts) {
  this.opts = opts;
  this.id = opts.id;
  this.userId = opts.userId;
  this.roleName = opts.roleName;
  this.sex = opts.sex;
  this.pinCode = opts.pinCode;
  this.accountAmount = opts.accountAmount;
  this.level = opts.level;
  this.experience = opts.experience;
  this.loginCount = opts.loginCount;
  this.lastOnlineTime = opts.lastOnlineTime;
  this.areaId = opts.areaId;
}

Player.prototype.init = function() {
  this.type = this.consts.EntityType.PLAYER;
  logger.error('*************Player.prototype.init player');
  var Entity = bearcat.getFunction('entity');
  Entity.call(this, this.opts);
  this._init();
}

Player.prototype.upgrade = function() {
    while (this.experience >= this.nextLevelExp) {
        //logger.error('player.upgrade ' + this.experience + ' nextLevelExp: ' + this.nextLevelExp);
        this._upgrade();
    }
    this.emit('upgrade');
};

//Upgrade, update player's state
Player.prototype._upgrade = function() {
    this.level += 1;
    this.maxHp += Math.round(this.characterData.upgradeParam * this.characterData.hp);
    this.maxMp += Math.round(this.characterData.upgradeParam * this.characterData.mp);
    this.hp = this.maxHp;
    this.mp = this.maxMp;
    this.attackValue += Math.round(this.characterData.upgradeParam * this.characterData.attackValue);
    this.defenceValue += Math.round(this.characterData.upgradeParam * this.characterData.defenceValue);
    this.experience -= this.nextLevelExp;
    this.skillPoint += 1;
    this.nextLevelExp = dataApi.experience.findById(this.level+1).exp;
    this.setTotalAttackAndDefence();
    this.updateTeamMemberInfo();
};

// update team member info
Player.prototype.updateTeamMemberInfo = function() {
    if (this.teamId > consts.TEAM.TEAM_ID_NONE) {
        utils.myPrint('UpdateTeamMemberInfo is running ...');
        var memberInfo = this.toJSON4TeamMember();
        memberInfo.needNotifyElse = true;
        pomelo.app.rpc.manager.teamRemote.updateMemberInfo(null, memberInfo,
            function(err, ret) {
            });
    }
};

Player.prototype.addScore = function(score) {
  this.score += score;
};

Player.prototype.bet = function (msg) {
    this.emit(this.consts.Event.area.playerBet);
};


Player.prototype.unBet = function (msg) {
    this.emit(this.consts.Event.area.playerUnBet);
};

// Emit the event 'save'.
Player.prototype.save = function() {
    this.emit('save');
};

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Player.prototype.toJSON = function() {
  var r = this._toJSON();

  r['id'] = this.id;
  r['type'] = this.type;
  r['name'] = this.name;
  r['walkSpeed'] = this.walkSpeed;
  r['score'] = this.score;

  return r;
};

module.exports = {
  id: "player",
  func: Player,
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
}