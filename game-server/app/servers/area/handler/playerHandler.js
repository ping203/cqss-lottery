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
    var parseTypeInfo = msg.betParseInfo;

    var self = this;
    player.bet(period, identify, msg.betData, parseTypeInfo, function (err, betItem) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
        this.areaService.updateLatestBets(betItem);
    });
};

PlayerHandler.prototype.unBet = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);

    var self = this;
    player.unBet(parseInt(msg.entityId,10), function (err, betItem) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
        this.areaService.updateLatestBets(betItem);
    });
};

PlayerHandler.prototype.myBets = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyBets(msg.skip, msg.limit, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.myIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyIncomes(msg.skip, msg.limit, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.friendIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getFriendIncomes(msg.skip, msg.limit, function (err, result) {
        if(err){
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

PlayerHandler.prototype.setPinCode = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setPinCode(msg.pinCode);
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
    player.setPhone(msg.phone);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setEmail = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setEmail(msg.email);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.getLotterys = function (msg, session, next) {
    var lottery =  this.areaService.getLottery();
    lottery.getLotterys(msg.skip, msg.limit, function (err, result) {
        if(!!err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_LOTTERY_INFO_ERROR));
        }else {
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
        props: [{
            name: "areaService",
            ref: "areaService"
        }, {
            name: "dataApiUtil",
            ref: "dataApiUtil"
        }, {
            name: "consts",
            ref: "consts"
        }, {
            name: "daoUser",
            ref: "daoUser"
        }]
    });
};