var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'PlayerHandler');
var bearcat = require('bearcat');
var fs = require('fs');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');

var PlayerHandler = function (app) {
    this.app = app;
    this.consts = null;
    this.areaService = null;
};

PlayerHandler.prototype.bet = function (msg, session, next) {
    var period = this.areaService.getLottery().getNextPeriod();
    var identify = this.areaService.getLottery().getIdentify();
    var player = this.areaService.getPlayer(session.uid);
    var parseBetInfo = msg.betParseInfo;

    for (var type in parseBetInfo.betTypeInfo) {
        // 平台限额检查
        var answer = this.platformBet.canBet(parseBetInfo.betTypeInfo[type].type.code, parseBetInfo.betTypeInfo[type].money);
        if (answer.result.code != Code.OK.code) {
            next(null, answer);
            return;
        }
        parseBetInfo.betTypeInfo[type].freeBetValue = answer.data.freeBetValue;

        //玩家限额检查
        var pri = player.canBet(parseBetInfo.betTypeInfo[type].type.code, parseBetInfo.betTypeInfo[type].money)
        if (pri.result.code != Code.OK.code) {
            next(null, pri);
            return;
        }
        parseBetInfo.betTypeInfo[type].priFreeBetValue = pri.data.freeBetValue;
    }

    var self = this;
    player.bet(period, identify, msg.betData, parseBetInfo, function (err, betItem) {
        if (err) {
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
        self.areaService.updateLatestBets(betItem);
    });
};

PlayerHandler.prototype.unBet = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);

    var self = this;
    player.unBet(parseInt(msg.entityId, 10), function (err, betItem) {
        if (err) {
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
        self.areaService.updateLatestBets(betItem);
    });
};

PlayerHandler.prototype.myBets = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyBets(msg.skip, msg.limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.myIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyIncomes(msg.skip, msg.limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.friendIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getFriendIncomes(msg.skip, msg.limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.setRoleName = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setRoleName(msg.roleName);

    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setImageId = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setImageId(msg.imageId);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setPhone = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    var ret = player.setPhone(msg.phone);
    next(null, new Answer.NoDataResponse(ret));
};

PlayerHandler.prototype.bindBankCard = function (msg, session, next) {
    if(!msg.address || !msg.username || !msg.cardNO || !msg.pinCode){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.bindCard(msg.address, msg.username, msg.cardNO, msg.pinCode, function (err, result) {
        if(!!err){
            next(null, new Answer.NoDataResponse(err));
        }
        else {
            next(null, new Answer.DataResponse(Code.OK, result));
        }
    });
};

PlayerHandler.prototype.cashRequest = function (msg, session, next) {
    if(!msg.pinCode || !msg.money){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var money = parseInt(msg.money, 10);
    if(isNaN(money)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var self = this;
    this.daoRecord.add(session.uid, money, this.consts.RecordType.CASH, this.consts.RecordOperate.OPERATE_REQ, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.DBFAIL));
            return;
        }
        var playerId = session.uid;
        var player = self.areaService.getPlayer(playerId);
        let ret = player.cash(self.utils.createSalt(msg.pinCode), money);
        next(null, new Answer.NoDataResponse(ret));
    });
};

PlayerHandler.prototype.setEmail = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    var ret = player.setEmail(msg.email);
    next(null, new Answer.NoDataResponse(ret));
};

PlayerHandler.prototype.getGMWeiXin = function (msg, session, next) {
    var lottery = this.areaService.getLottery();
    next(null, new Answer.DataResponse(Code.OK, lottery.getWeiXin()));
};

PlayerHandler.prototype.getRecords = function (msg, session, next) {
    this.daoRecord.getRecords(session.uid, msg.skip, msg.limit, function (err, results) {
        if(!!err){
            next(null, new Answer.NoDataResponse(Code.DBFAIL));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, results));
    });
};

PlayerHandler.prototype.getLotterys = function (msg, session, next) {
    var lottery = this.areaService.getLottery();
    lottery.getLotterys(msg.skip, msg.limit, function (err, result) {
        if (!!err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_LOTTERY_INFO_ERROR));
        } else {
            next(null, new Answer.DataResponse(Code.OK, result));
        }
    });
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "playerHandler",
        func: PlayerHandler,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name: "areaService", ref: "areaService"},
            {name: "dataApiUtil", ref: "dataApiUtil"},
            {name: "consts", ref: "consts"},
            {name: "daoUser", ref: "daoUser"},
            {name: 'platformBet', ref: 'platformBet'},
            {name: 'daoRecord', ref: 'daoRecord'},
            {name: 'utils', ref: 'utils'},
        ]
    });
};