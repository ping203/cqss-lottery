var logger = require('pomelo-logger').getLogger('bearcat-lottery');
var bearcat = require('bearcat');
var util = require('util');
var Code = require('../../../../shared/code');
var Answer = require('../../../../shared/answer');

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
    this.state = opts.state;

    if(!!opts.ext){
        this.ext = JSON.parse(opts.ext);
    }
    else {
        this.ext = {
            phone:0,
            email:0,
            pinCode:0
        }
    }

}

Player.prototype.init = function () {
    this.setRank();
    this.setNextLevelExp();
    this.type = this.consts.EntityType.PLAYER;

    var Entity = bearcat.getFunction('entity');
    Entity.call(this, this.opts);
    this._init();

    this.betStatistics = null;
    this.bets = bearcat.getBean("bets", {})
    this.betMoneyMap = new Map(); //每一期个人投注类型总和限制
    this.bank = null;
};

Player.prototype.setBetStatistics = function (betStatistics) {
    this.betStatistics = betStatistics;
};

Player.prototype.setBank = function (bank) {
    this.bank = bank;
};

Player.prototype.restoreExceptBet = function () {
    var self = this;
    this.daoBets.restoreBets(this.id, function (err, betItems) {
        if(!!err || betItems.length === 0){
            return;
        }
        for(let i = 0; i< betItems.length;i++){
            betItems[i].setState(self.consts.BetState.BET_CANCLE);
            self.bets.addItem(betItems[i]);
            self.accountAmount += betItems[i].getBetMoney();
            betItems[i].save();
            self.save();
            self.changeNotify();
        }
    })
};

Player.prototype.isIdle = function () {
    if (this.bets.isEmpty()) {
        return true;
    }
    return false;
};

Player.prototype.transferTask = function (target) {
    target.bets = this.bets;
    target.betMoneyMap =  this.betMoneyMap;
}

Player.prototype.setRank = function () {
    this.rank = this.sysConfig.getRank(this.level);
};

Player.prototype.setNextLevelExp = function () {
    var _exp = this.sysConfig.getUpdate(this.level);
    if (!!_exp) {
        this.nextLevelExp = _exp;
    } else {
        this.nextLevelExp = 999999999;
    }
}

Player.prototype.addExperience = function (exp) {
    if(isNaN(exp)){
        logger.error('经验值无效');
        return;
    }

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
    this.setRank();
};

//Upgrade, update player's state
Player.prototype._upgrade = function () {
    this.level += 1;
    this.experience -= this.nextLevelExp;
    this.setNextLevelExp();
};

Player.prototype.setState = function(state){
    this.state = state;
    this.save();
};

Player.prototype.setRoleName = function (name) {
    this.roleName = name;
    this.save();
    this.changeNotify();
};

Player.prototype.setImageId = function (imageId) {
    this.imageId = imageId;
    this.save();
    this.changeNotify();
};

Player.prototype.setPhone = function (phone) {
    if(this.ext.phone === 1){
        return Code.GAME.FA_MODIFY_LIMIT;
    }
    this.phone = phone;
    this.ext.phone = 1;
    this.save();
    this.changeNotify();
    return Code.OK;
};

Player.prototype.bindCard = function (address, username, cardNO, pinCode, cb) {
    if(this.ext.pinCode === 1){
        this.utils.invokeCallback(cb, Code.GAME.FA_CANNOT_REBIND_CARD, null);
        return;
    }

    var self = this;
    this.daoBank.bind(this.id, address, username, cardNO, function (err, result) {
        if(!err && !!result){
            self.pinCode = self.utils.createSalt(pinCode);
            self.ext.pinCode = 1;
            self.bank = result;
            self.save();
            self.changeNotify();
            self.utils.invokeCallback(cb, null, result);
        }
        else {
            self.utils.invokeCallback(cb, Code.DBFAIL, null);
        }
    });
};

Player.prototype.setEmail = function (email) {
    if(this.ext.email === 1){
        return Code.GAME.FA_MODIFY_LIMIT;
    }
    this.email = email;
    this.ext.email = 1;
    this.save();
    this.changeNotify();
    return Code.OK;
};

Player.prototype.recharge = function (money) {
    this.accountAmount += money;
    this.save();
    this.changeNotify();
};

Player.prototype.cash = function (pinCode, money) {
    if(pinCode !== this.pinCode){
        return Code.GAME.FA_CAST_PINCODE_ERR;
    }
    if (this.accountAmount < money){
        return Code.GAME.FA_CAST_ERROR;
    };
    this.accountAmount -= money;
    this.save();
    this.changeNotify();
    return Code.OK;
};

Player.prototype.setCanTalk = function (canTalk) {
    this.forbidTalk = canTalk;
    this.save();
};

Player.prototype.getMyBets = function (skip, limit, cb) {
    this.daoBets.getBets(this.id, skip, limit, cb);
};

Player.prototype.getMyIncomes = function (skip, limit, cb) {
    this.daoIncome.getPlayerIncomes(this.id, skip, limit, cb);
};

Player.prototype.getFriendIncomes = function (skip, limit, cb) {
    this.daoIncome.getMyFriendIncomes(this.id, skip, limit, cb);
};

Player.prototype.getBaseInfo = function () {

    var winRate = 0;
    if (this.betStatistics.betCount > 0) {
        winRate = Number(((this.betStatistics.winCount / this.betStatistics.betCount) * 100).toFixed(2))
    }
    return {
        roleName: this.roleName,
        imageId: this.imageId,
        level: this.level,
        accountAmount: this.accountAmount,
        winCount: this.betStatistics.winCount,
        winRate: winRate
    }
};

//todo:检查用户投注类型总额是否超限
Player.prototype.canBet = function (type, value) {
    var num = this.betMoneyMap.get(type);
    num = !!num ? num : 0;
    var err = {};
    var freeBetValue = 0;
    if (this.betLimitCfg.playerLimit(type, num + value)) {
        err.code = Code.GAME.FA_BET_PLAYER_LIMIT.code;
        err.desc = Code.GAME.FA_BET_PLAYER_LIMIT.desc + '最多还能下注' + (this.betLimitCfg.getPlayerValue(type) - num).toString();
        freeBetValue = this.betLimitCfg.getPlayerValue(type) - num;
    } else {
        err = Code.OK;
        freeBetValue = this.betLimitCfg.getPlayerValue(type) - (num + value);
    }

    return new Answer.DataResponse(err, {freeBetValue: freeBetValue});
};

Player.prototype.addBetValue = function (type, value) {
    var num = this.betMoneyMap.get(type);
    num = !!num ? num : 0;
    num += value;
    this.betMoneyMap.set(type, num);
};


Player.prototype.reduceBetValue = function (type, value) {
    var num = this.betMoneyMap.get(type);
    num = !!num ? num : 0;
    num -= value;
    this.betMoneyMap.set(type, num);
    var limis = this.betLimitCfg.getPlayerValue(type);
    return limis- num;
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
        betInfo: betData,
        state: this.consts.BetState.BET_WAIT,
        betCount: betParseInfo.betItems.length,
        winCount: 0,
        betMoney: betParseInfo.total,
        winMoney: 0,
        betTime: Date.now(),
        betTypeInfo: betParseInfo.betTypeInfo
    }, function (err, betItem) {
        if (err) {
            self.utils.invokeCallback(cb, err, null);
            return;
        }
        self.betStatistics.betCount += betParseInfo.betItems.length;
        self.accountAmount -= betParseInfo.total;
        self.save();
        self.changeNotify();

        for (var type in betParseInfo.betTypeInfo) {
            var freeBet = self.platformBet.addBet(betParseInfo.betTypeInfo[type].type.code, betParseInfo.betTypeInfo[type].money);
            self.addBetValue(betParseInfo.betTypeInfo[type].type.code, betParseInfo.betTypeInfo[type].money);
        }

        betItem.setBetItems(betParseInfo.betItems);
        betItem.setRoleName(self.roleName);

        self.bets.addItem(betItem);

        self.emit(self.consts.Event.area.playerBet, {player: self, betItem: betItem});
        self.utils.invokeCallback(cb, null, betItem);

        betItem.save();
    });

};

Player.prototype.unBet = function (entityId, cb) {
    var betItem = this.bets.getItem(entityId);
    if (betItem) {
        if (betItem.getState() != this.consts.BetState.BET_WAIT) {
            this.utils.invokeCallback(cb, Code.GAME.FA_BET_STATE, null);
            return;
        }

        betItem.setState(this.consts.BetState.BET_CANCLE);
        this.accountAmount += betItem.getBetMoney();
        this.betStatistics.betCount -= betItem.getBetCount();

        var betTypeInfo = betItem.getBetTypeInfo();
        for (var type in betTypeInfo) {
            var freeValue = this.platformBet.reduceBet(betTypeInfo[type].type.code, betTypeInfo[type].money);
            betItem.setFreeBetValue(betTypeInfo[type].type.code, freeValue);

            var priFreeValue = this.reduceBetValue(betTypeInfo[type].type.code, betTypeInfo[type].money);
            betItem.setPriFreeBetValue(betTypeInfo[type].type.code, priFreeValue);
        }

        betItem.save();

        this.utils.invokeCallback(cb, null, betItem);
        this.save();
        this.changeNotify();
        this.emit(this.consts.Event.area.playerUnBet, {player: this, betItem: betItem});
    }
    else {
        this.utils.invokeCallback(cb, Code.GAME.FA_ENTITY_NOT_EXIST, null);
    }
};

Player.prototype.calcExp = function (calcParam) {
    var exp_base = this.sysConfig.getExp();
    var exp = ((calcParam.betCount - calcParam.winCount)*exp_base.lose + calcParam.winCount* exp_base.win + calcParam.betMoney* exp_base.money);
    return exp;
};


Player.prototype.openCode = function (period, openCodeResult, numbers) {
    var calcResult = this.bets.openCodeCalc(period, openCodeResult);
    if (calcResult.winCount != 0) {
        this.betStatistics.winCount += calcResult.winCount;
        this.accountAmount += calcResult.winMoney;
        this.addExperience(this.calcExp(calcResult));
        this.save();
        this.changeNotify();
    }

    var winMoney = calcResult.winMoney - calcResult.betMoney;
    if(calcResult.betCount  > 0){
        this.emit(this.consts.Event.area.playerWinner, {player: this, winMoney:winMoney,numbers:numbers, itemOK:calcResult.itemOK, uids: [{uid: this.id, sid: this.serverId}]});
    }

    this.betMoneyMap.clear();

    if(winMoney > 0){
        return {name:this.roleName, money:winMoney};
    }

    return null;
};

// Emit the event 'save'.
Player.prototype.save = function () {
    this.emit('save');
};

Player.prototype.changeNotify = function () {
    this.emit(this.consts.Event.area.playerChange, {player: this, uids: [{uid: this.id, sid: this.serverId}]});
};

Player.prototype.strip = function () {

    var r = {
        id: this.id,
        entityId: this.entityId,
        kindId: this.kindId,
        kindName: this.kindName,
        type: this.type,
        roleName: this.roleName,
        imageId: this.imageId,
        pinCode: this.pinCode,
        username: this.username,
        phone: this.phone,
        email: this.email,
        inviter: this.inviter,
        active: this.active,
        forbidTalk: this.forbidTalk,
        role: this.role,
        rank: this.rank,
        accountAmount: this.accountAmount,
        level: this.level,
        experience: this.experience,
        loginCount: this.loginCount,
        lastLoinTime: this.lastLoinTime,
        betStatistics: this.betStatistics,
        bank:this.bank,
        state:this.state,
        ext:JSON.stringify(this.ext)
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
        {name: "betLimitCfg", ref: "betLimitCfg"},
        {name: "sysConfig", ref: "sysConfig"},
        {name: "daoBank", ref: "daoBank"}
    ]
}