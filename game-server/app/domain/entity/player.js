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
}

Player.prototype.init = function () {

    this.setRank();
    this.setNextLevelExp();
    this.type = this.consts.EntityType.PLAYER;
    logger.error('*************Player.prototype.init player');
    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();
};

Player.prototype.setRank = function () {
    var rankData = this.dataApiUtil.rank().data;
    var preId = null;
    for (var id in rankData){
        if(this.level === rankData[id].level){
            this.rank = rankData[id].name;
            break;
        }else if(this.level < rankData[id].level){
            this.rank = rankData[preId].name;
            break;
        }
        preId = id;
    }
};

Player.prototype.setNextLevelExp = function(){

    var _exp = this.dataApiUtil.experience().findById(this.level + 1);
    if (!!_exp) {
        this.nextLevelExp = _exp.exp;
    } else {
        this.nextLevelExp = 999999999;
    }
}

Player.prototype.addExperience = function (exp) {
    this.experience += exp;
    if (this.experience >= this.nextLevelExp) {
        this.upgrade();
    }
    this.save();
};

Player.prototype.upgrade = function () {
    while (this.experience >= this.nextLevelExp) {
        //logger.error('player.upgrade ' + this.experience + ' nextLevelExp: ' + this.nextLevelExp);
        this._upgrade();
    }
    this.emit('upgrade');
};

//Upgrade, update player's state
Player.prototype._upgrade = function () {
    this.level += 1;
    this.experience -= this.nextLevelExp;
    this.skillPoint += 1;
    this.setNextLevelExp();
};

Player.prototype.setRoleName = function (name) {
  this.roleName = name;
  this.save();
};
Player.prototype.bet = function (msg) {
    this.emit(this.consts.Event.area.playerBet);
};


Player.prototype.unBet = function (msg) {
    this.emit(this.consts.Event.area.playerUnBet);
};

// Emit the event 'save'.
Player.prototype.save = function () {
    this.emit('save');
};

Player.prototype.strip = function () {
    return {
        id: this.id,
        entityId: this.entityId,
        kindId: this.kindId,
        kindName: this.kindName,
        areaId: this.areaId,
        type: this.type,
        userId: this.userId,
        roleName: this.roleName,
        sex: this.sex,
        pinCode: this.pinCode,
        accountAmount: this.accountAmount,
        level: this.level,
        rank:this.rank,
        loginCount: this.loginCount,
        lastOnlineTime: this.lastOnlineTime
    };
}

/**
 * Parse String to json.
 * It covers object' method
 *
 * @param {String} data
 * @return {Object}
 * @api public
 */
Player.prototype.toJSON = function () {
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
    props: [
        {name: "consts", ref: "consts"},
        {name: "dataApiUtil", ref: "dataApiUtil"}
    ]
}