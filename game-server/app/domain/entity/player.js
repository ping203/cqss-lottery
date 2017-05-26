var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');
var Code = require('../../../../shared/code');

function Player(opts) {
    this.opts = opts;
    this.id = opts.id;
    this.userId = opts.userId;
    this.roleName = opts.roleName;
    this.imageId = opts.imageId;
    this.sex = opts.sex;
    this.pinCode = opts.pinCode;
    this.accountAmount = opts.accountAmount || 3000;
    this.level = opts.level;
    this.experience = opts.experience;
    this.loginCount = opts.loginCount;
    this.lastLoinTime = opts.lastLoinTime;
    this.betStatistics = opts.betStatistics;
    this.forbidTalk = opts.forbidTalk;
}

Player.prototype.init = function () {
    this.setRank();
    this.setNextLevelExp();
    this.type = this.consts.EntityType.PLAYER;

    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();

    this.bets = bearcat.getBean("bets", {})
};

Player.prototype.setRank = function () {
    var rankData = this.dataApiUtil.rank().data;
    var preId = null;
    for (var id in rankData) {
        if (this.level === rankData[id].level) {
            this.rank = rankData[id].name;
            break;
        } else if (this.level < rankData[id].level) {
            this.rank = rankData[preId].name;
            break;
        }
        preId = id;
    }
};

Player.prototype.setNextLevelExp = function () {

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
    this.changeNotify();
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
    this.changeNotify();
};

Player.prototype.setPinCode = function (pinCode) {
    this.pinCode = pinCode;
    this.save();
};

//todo:检查用户投注类型总额是否超限
Player.prototype.canBet = function (type, value) {
    return this.bets.canBetType(type, value);
};

Player.prototype.bet = function (period, identify, betParseInfo, cb) {

    if (betParseInfo.total > this.accountAmount) {
        this.utils.invokeCallback(cb, Code.GAME.FA_ACCOUNTAMOUNT_NOT_ENOUGH, null);
        return;
    }

    var self = this;
    this.daoBets.addBet({
        playerId: this.id,
        period: period,
        identify: identify,
        betData: betParseInfo.betData,
        state: this.consts.BetState.BET_WAIT,
        betCount: betParseInfo.betItems.length,
        winCount:0,
        betMoney: betParseInfo.total,
        winMoney:0,
        betTime: Date.now()
    }, function (err, betItem) {
        if (err) {
            self.utils.invokeCallback(cb, err, null);
            return;
        }

        self.betStatistics.betCount += betParseInfo.betItems.length;
        self.accountAmount -= betParseInfo.total;
        self.save();
        //todo 通知玩家信息变化吧
        self.changeNotify();
        betItem.setBetItems(betParseInfo.betItems);
        self.bets.addItem(betItem);
        self.utils.invokeCallback(cb, null, null);
        self.emit(self.consts.Event.area.playerBet, {player: self, betItem: betItem});

    });

};

Player.prototype.unBet = function (entityId, cb) {
    var betItem = this.bets.getItem(entityId);
    if(betItem){
        if(betItem.getItemState(entityId) != this.consts.BetState.BET_WAIT){
            this.utils.invokeCallback(cb, Code.GAME.FA_BET_STATE, null);
            return;
        }

        betItem.setItemState(entityId, this.consts.BetState.BET_CANCLE);
        this.emit(this.consts.Event.area.playerUnBet, {player: self, betItem: betItem});

        this.accountAmount += betItem.getBetMoney();
        this.betStatistics.betCount -= betItem.getBetCount();
        this.save();

        this.utils.invokeCallback(cb, null, null);

        //todo 通知玩家信息变化吧
        this.changeNotify();
    }
    else {
        this.utils.invokeCallback(cb, Code.GAME.FA_ENTITY_NOT_EXIST, null);
    }
};


Player.prototype.openTheLottery = function (openInfo) {
    var openResult = this.bets.openLottery(openInfo);
    if(openResult.winCount != 0){
        this.betStatistics.winCount += openResult.winCount;
        this.accountAmount += openResult.winMoney;
        this.save();
        //todo 通知玩家信息变化吧
        this.changeNotify();
    }
};

// Emit the event 'save'.
Player.prototype.save = function () {
    this.emit('save');
};

Player.prototype.changeNotify = function(){
    this.emit(this.consts.Event.area.playerChange, {player: this,uids:[{uid:this.userId, sid:this.serverId}]});
};

Player.prototype.strip = function () {
    var r = {
        id: this.id,
        entityId: this.entityId,
        kindId: this.kindId,
        kindName: this.kindName,
        areaId: this.areaId,
        type: this.type,
        userId: this.userId,
        roleName: this.roleName,
        imageId:this.imageId,
        sex: this.sex,
        pinCode: this.pinCode,
        accountAmount: this.accountAmount,
        level: this.level,
        experience: this.experience,
        rank: this.rank,
        loginCount: this.loginCount,
        lastLoinTime: this.lastLoinTime,
        forbidTalk:this.forbidTalk,
        betStatistics:this.betStatistics
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