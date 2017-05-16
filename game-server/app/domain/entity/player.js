var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');
var Code = require('../../../../shared/code');

function Player(opts) {
    this.opts = opts;
    this.id = opts.id;
    this.roleName = opts.roleName;
    this.imageId = opts.imageId;
    this.sex = opts.sex;
    this.pinCode = opts.pinCode;
    this.username = opts.username;
    this.phone = opts.phone;
    this.email = opts.email;
    this.inviter = opts.inviter;
    this.active = opts.active;
    this.forbidTalk = opts.forbidTalk;
    this.role = opts.role;
    this.rank = opts.rank;
    this.accountAmount = opts.accountAmount || 3000; //todo:test
    this.level = opts.level;
    this.experience = opts.experience;
    this.loginCount = opts.loginCount;
    this.lastLoinTime = opts.lastLoinTime;
    this.betStatistics = opts.betStatistics;
}

Player.prototype.init = function () {
    this.setRank();
    this.setNextLevelExp();
    this.type = this.consts.EntityType.PLAYER;

    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();

    this.bets = bearcat.getBean("bets", {})
    this.betMoneyMap = new Map();
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
    this.changeNotify();
};

Player.prototype.setImageId = function(imageId){
    this.imageId = imageId;
    this.save();
    this.changeNotify();
}

Player.prototype.setPhone = function(phone){
    this.phone = phone;
    this.save();
    this.changeNotify();
}

Player.prototype.setEmail = function(email){
    this.email = email;
    this.save();
    this.changeNotify();
}

Player.prototype.recharge = function (money) {
    this.accountAmount += money;
    this.save();
    this.changeNotify();
    //todo 充值记录
};

Player.prototype.cast = function (money) {
    if(this.accountAmount < money) return false;
    this.accountAmount -= money;
    this.save();
    this.changeNotify();
    //todo 提现记录
    return true;

};

Player.prototype.getMyBets = function(skip, limit, cb){
    this.daoBets.getBets(this.id, skip, limit, cb);
}

Player.prototype.getMyIncomes = function(skip, limit, cb){
    this.daoIncome.getPlayerIncomes(this.id, skip, limit, cb);
}

Player.prototype.getFriendIncomes = function(skip, limit, cb){
    this.daoIncome.getMyFriendIncomes(this.id, skip, limit, cb);
}

//todo:检查用户投注类型总额是否超限
Player.prototype.canBet = function (type, value) {
    var num = this.betMoneyMap.get(type);
    num = !!num?num:0;
    var err = {};
    if (this.betLimitCfg.playerLimit(type, num + value)) {
        err.code = Code.GAME.FA_BET_PLAYER_LIMIT.code;
        err.desc = Code.GAME.FA_BET_PLAYER_LIMIT.desc + '最多还能下注' + this.betLimitCfg.getPlayerValue(type);
    } else {
        err = null;
    }
    return err;
};

Player.prototype.bet = function (period, identify, betData, betParseInfo, cb) {
    if (betParseInfo.total > this.accountAmount) {
        this.utils.invokeCallback(cb, Code.GAME.FA_ACCOUNTAMOUNT_NOT_ENOUGH, null);
        return;
    }
    var self = this;
    this.daoBets.addBet({
        playerId: this.id,
        period: period,
        identify: identify,
        betData: betData,
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
        self.changeNotify();

        betItem.setBetItems(betParseInfo.betItems);
        betItem.setBetTypeInfo(betParseInfo.betTypeInfo);
        betItem.roleName = this.roleName;
        self.bets.addItem(betItem);

        for(var type in betParseInfo.betTypeInfo){
            self.platformBet.addBet(betParseInfo.betTypeInfo[type].type.code, betParseInfo.betTypeInfo[type].money);

            var num = self.betMoneyMap.get(betParseInfo.betTypeInfo[type].type.code);
            num = !!num?num:0;
            num += betParseInfo.betTypeInfo[type].money;
            self.betMoneyMap.set(betParseInfo.betTypeInfo[type].type.code, num);
        }

        self.emit(self.consts.Event.area.playerBet, {player: self, betItem: betItem});
        self.utils.invokeCallback(cb, null, betItem);
    });

};

Player.prototype.unBet = function (entityId, cb) {
    var betItem = this.bets.getItem(entityId);
    if(betItem){
        if(betItem.getState(entityId) != this.consts.BetState.BET_WAIT){
            this.utils.invokeCallback(cb, Code.GAME.FA_BET_STATE, null);
            return;
        }

        betItem.setState(entityId, this.consts.BetState.BET_CANCLE);
        this.accountAmount += betItem.getBetMoney();
        this.betStatistics.betCount -= betItem.getBetCount();

        var betTypeInfo = betItem.getBetTypeInfo();
        for(var type in betTypeInfo){
            var freeValue = this.platformBet.reduceBet(betTypeInfo[type].type.code, betTypeInfo[type].money);
            betItem.setFreeBetValue(betTypeInfo[type].type.code, freeValue);

            var num = this.betMoneyMap.get(betTypeInfo[type].type.code);
            num = !!num?num:0;
            num -= betTypeInfo[type].money;
            this.betMoneyMap.set(betTypeInfo[type].type.code, num);
        }

        this.utils.invokeCallback(cb, null, betItem);
        this.save();
        this.changeNotify();
        this.emit(this.consts.Event.area.playerUnBet, {player: this, betItem: betItem});
    }
    else {
        this.utils.invokeCallback(cb, Code.GAME.FA_ENTITY_NOT_EXIST, null);
    }
};

Player.prototype.openTheLottery = function (openInfo) {
    var openResult = this.bets.openLottery(openInfo, this.level);
    if(openResult.winCount != 0){
        this.betStatistics.winCount += openResult.winCount;
        this.accountAmount += openResult.winMoney;
        this.save();
        this.changeNotify();
    }

    this.betMoneyMap.clear();
};

// Emit the event 'save'.
Player.prototype.save = function () {
    this.emit('save');
};

Player.prototype.changeNotify = function(){
    this.emit(this.consts.Event.area.playerChange, {player: this,uids:[{uid:this.id, sid:this.serverId}]});
};

Player.prototype.strip = function () {

    var r = {
        id: this.id,
        entityId: this.entityId,
        kindId: this.kindId,
        kindName: this.kindName,
        type: this.type,
        roleName: this.roleName,
        imageId:this.imageId,
        pinCode: this.pinCode,
        username:this.username,
        phone:this.phone,
        email:this.email,
        inviter:this.inviter,
        active:this.active,
        forbidTalk:this.forbidTalk,
        role:this.role,
        rank: this.rank,
        accountAmount: this.accountAmount,
        level: this.level,
        experience: this.experience,
        loginCount: this.loginCount,
        lastLoinTime: this.lastLoinTime,
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
        {name: "utils", ref: "utils"},
        {name: "daoIncome", ref: "daoIncome"},
        {name: "platformBet", ref: "platformBet"},
        {name: "betLimitCfg", ref: "betLimitCfg"}
    ]
}