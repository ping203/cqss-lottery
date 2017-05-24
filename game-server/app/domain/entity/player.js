var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');
var Code = require('../../../../shared/code');
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
    this.bets = opts.bets;
}

Player.prototype.init = function () {
    this.setRank();
    this.setNextLevelExp();
    this.type = this.consts.EntityType.PLAYER;

    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();

    this.bets = bearcat.getBean("bets",{})
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

Player.prototype.setPinCode = function (pinCode) {
  this.pinCode = pinCode;
  this.save();
};

//todo:检查用户投注类型总额是否超限
Player.prototype.canBet = function (type, value, err) {
    return this.bets.canBetType(type, value, err);
};

Player.prototype.bet = function (period, identify, betParseInfo, cb) {

    if(betParseInfo.total > this.accountAmount){
        this.utils.invokeCallback(cb, Code.GAME.FA_ACCOUNTAMOUNT_NOT_ENOUGH, null);
        return;
    }

    var self = this;
    this.daoBet.addBet({
        playerId:this.id,
        period:period,
        identify:identify,
        betInfo:betParseInfo.betData,
        state:this.consts.BetState.BET_WAIT,
        investmentMoney:betParseInfo.total,
        multiple:betParseInfo.betItems.size(),
        harvestMoney:0,
        betTime:Date.now()
    }, function (err, result) {
        if(err){
            self.utils.invokeCallback(cb, err, null);
            return;
        }
        result.setBetItems(betParseInfo.betItems);
        self.bets.addItem(result);
        self.utils.invokeCallback(cb, null, null);
        self.emit(self.consts.Event.area.playerBet,{player:self,betInfo:result});
    });

};


Player.prototype.unBet = function (entityId) {
    var betItem = this.bets.getItem(entityId);
    betItem.setItemState(entityId, this.consts.BetState.BET_CANCLE);
    this.emit(this.consts.Event.area.playerUnBet);
};


Player.prototype.openTheLottery = function (openInfo) {
    this.bets.openLottery(openInfo);
};

// Emit the event 'save'.
Player.prototype.save = function () {
    this.emit('save');
};

Player.prototype.strip = function () {
    var r= {
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
        experience:this.experience,
        rank:this.rank,
        loginCount: this.loginCount,
        lastOnlineTime: this.lastOnlineTime
    };

    return r;
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
        {name: "dataApiUtil", ref: "dataApiUtil"},
        {name: "daoBets", ref: "daoBets"},
        {name: "utils", ref: "utils"}
    ]
}