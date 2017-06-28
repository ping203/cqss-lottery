var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'PlayerHandler');
var bearcat = require('bearcat');
var fs = require('fs');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');
const async = require('async');

var PlayerHandler = function (app) {
    this.app = app;
    this.consts = null;
    this.gameService = null;
};

PlayerHandler.prototype.bet = function (msg, session, next) {
    if (!this.gameService.canBetNow()) {
        next(null, new Answer.NoDataResponse(Code.GAME.FA_BET_CHANNEL_CLOSE));
        return;
    }

    if (!msg.betData) {
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    let self = this;
    async.waterfall([
        function (cb) {
            self.betParser.parse(msg.betData, function (err, result) {
                if (err) {
                    cb(new Answer.NoDataResponse(err));
                    return;
                }
                cb(null, result);
            });
        }, function (result, cb) {
            let period = self.gameService.getLottery().getNextPeriod();
            let identify = self.gameService.getLottery().getIdentify();
            let player = self.gameService.getPlayer(session.uid);
            let parseBetInfo = result;

            let betTypeInfoArr = [];
            for (let type in parseBetInfo.betTypeInfo) {
                betTypeInfoArr.push(parseBetInfo.betTypeInfo[type]);
            }

            async.map(betTypeInfoArr, function (item, callback) {

                //平台限额检查
                self.platformBet.canBet(item.type.code, item.money, function (ret) {
                    if(ret.result.code != Code.OK.code){
                        callback(ret.result);
                        return;
                    }
                    item.freeBetValue = ret.data.freeBetValue;

                    //玩家限额检查
                    let pri = player.canBet(item.type.code, item.money)
                    if (pri.result.code != Code.OK.code) {
                        callback(pri.result);
                        return;
                    }
                    item.priFreeBetValue = pri.data.freeBetValue;
                    callback(null, item);
                });
            },function(err, result) {
                if(err){
                    cb(new Answer.NoDataResponse(err));
                    logger.error('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^3333333', err);
                    return;
                }

                for (let type in parseBetInfo.betTypeInfo) {
                    logger.error('^^^^^^^^result:', parseBetInfo.betTypeInfo[type]);
                }

                player.bet(period, identify, msg.betData, parseBetInfo, function (err, betItem) {
                    if (err) {
                        cb(new Answer.NoDataResponse(err));
                        return;
                    }
                    cb();
                    self.gameService.updateLatestBets(betItem.strip());
                });

            });
        }
    ], function (err) {
        if (err) {
            next(null, err);
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

PlayerHandler.prototype.unBet = function (msg, session, next) {
    if (!this.gameService.canBetNow()) {
        next(null, new Answer.NoDataResponse(Code.GAME.FA_BET_CHANNEL_CLOSE));
        return;
    }

    var player = this.gameService.getPlayer(session.uid);
    var self = this;
    player.unBet(parseInt(msg.entityId, 10), function (err, betItem) {
        if (err) {
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
        self.gameService.updateLatestBets(betItem.strip());
    });
};

PlayerHandler.prototype.myBets = function (msg, session, next) {
    var player = this.gameService.getPlayer(session.uid);
    let skip = Number(msg.skip);
    let limit = Number(msg.limit);
    if(isNaN(skip) || isNaN(limit)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    player.getMyBets(skip, limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.myIncome = function (msg, session, next) {
    var player = this.gameService.getPlayer(session.uid);
    let skip = Number(msg.skip);
    let limit = Number(msg.limit);
    if(isNaN(skip) || isNaN(limit)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    player.getMyIncomes(skip, limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.friendIncome = function (msg, session, next) {
    var player = this.gameService.getPlayer(session.uid);
    let skip = Number(msg.skip);
    let limit = Number(msg.limit);
    if(isNaN(skip) || isNaN(limit)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    player.getFriendIncomes(skip, limit, function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.setRoleName = function (msg, session, next) {
    var self = this;
    this.daoUser.checkRoleName(msg.roleName).then(used => {
        if (used) {
            next(null, new Answer.NoDataResponse(Code.USER.FA_USER_ROLENAME_AREADY_EXIST));
            return;
        }
        var playerId = session.uid;
        var player = self.gameService.getPlayer(playerId);
        player.setRoleName(msg.roleName);
        next(null, new Answer.NoDataResponse(Code.OK));
    }).catch(err => {
        next(null, new Answer.NoDataResponse(Code.DBFAIL));
    });


};

PlayerHandler.prototype.setImageId = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.gameService.getPlayer(playerId);
    player.setImageId(msg.imageId);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setPhone = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.gameService.getPlayer(playerId);
    var ret = player.setPhone(msg.phone);
    next(null, new Answer.NoDataResponse(ret));
};
// body":{"cardNO":"","address":"","username":"","pinCode":"123456","wechat":"wechat","alipay":"zhifubao"
PlayerHandler.prototype.bindBankCard = function (msg, session, next) {
    if ((!!(msg.address && msg.username && msg.cardNO) || !!msg.wechat || !!msg.alipay) && !!msg.pinCode) {
        var playerId = session.uid;
        var player = this.gameService.getPlayer(playerId);
        player.bindCard(msg.address, msg.username, msg.cardNO, msg.alipay, msg.wechat, msg.pinCode, function (err, result) {
            if (!!err) {
                next(null, new Answer.NoDataResponse(err));
            }
            else {
                next(null, new Answer.DataResponse(Code.OK, result));
            }
        });
    }
    else {
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
    }
};

// 提现请求
PlayerHandler.prototype.cashRequest = function (msg, session, next) {
    if (!msg.pinCode || !msg.money) {
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var money = parseInt(msg.money, 10);
    if (isNaN(money) || money === 0) {
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var playerId = session.uid;
    var player = this.gameService.getPlayer(playerId);
    let ret = player.cash(this.utils.createSalt(msg.pinCode), money);
    if (ret.code !== Code.OK.code) {
        next(null, new Answer.NoDataResponse(ret));
        return;
    }

    player.defineNotify(this.consts.MsgNotifyType.CASHFAIL, {money:money});

    this.daoRecord.add(session.uid, money, this.consts.RecordType.CASH, this.consts.RecordOperate.OPERATE_REQ, player.accountAmount, '', '', function (err, result) {
        if (err) {
            player.recharge(money);
            next(null, new Answer.NoDataResponse(Code.DBFAIL));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

PlayerHandler.prototype.setEmail = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.gameService.getPlayer(playerId);
    var ret = player.setEmail(msg.email);
    next(null, new Answer.NoDataResponse(ret));
};

PlayerHandler.prototype.getGMWeiXin = function (msg, session, next) {
    var lottery = this.gameService.getLottery();
    next(null, new Answer.DataResponse(Code.OK, lottery.getWeiXin()));
};

PlayerHandler.prototype.getRecords = function (msg, session, next) {
    let skip = Number(msg.skip);
    let limit = Number(msg.limit);
    if(isNaN(skip) || isNaN(limit)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    this.daoRecord.getRecords(session.uid, skip, limit, function (err, results) {
        if (!!err) {
            next(null, new Answer.NoDataResponse(Code.DBFAIL));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, results));
    });
};

PlayerHandler.prototype.getPlayerBaseInfo = function (msg, session, next) {
    if (!msg.uid) {
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var player = this.gameService.getPlayer(msg.uid);
    if (!!player) {
        next(null, new Answer.DataResponse(Code.OK, player.getBaseInfo()));
        return;
    }

    var self = this;
    this.daoUser.getPlayerAllInfo(msg.uid, function (err, _player) {
        if (err || !_player) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_PLAYER_INFO_ERROR));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, _player.getBaseInfo()));
    });
};

PlayerHandler.prototype.sendChatMsg = function (msg, session, next) {
    this.app.rpc.chat.chatRemote.send(session, msg, session.uid, session.get('roomId'), function (result) {
        next(null, new Answer.NoDataResponse(result));
    });
};

PlayerHandler.prototype.getChatHistory = function (msg, session, next) {
    logger.error()
    this.app.rpc.chat.chatRemote.getChatHistory(session, session.get('roomId'), function (err, result) {
        if (err) {
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
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
            {name: "gameService", ref: "gameService"},
            {name: "dataApiUtil", ref: "dataApiUtil"},
            {name: "consts", ref: "consts"},
            {name: "daoUser", ref: "daoUser"},
            {name: 'platformBet', ref: 'platformBet'},
            {name: 'daoRecord', ref: 'daoRecord'},
            {name: 'utils', ref: 'utils'},
            {name: 'betParser', ref: 'betParser'}
        ]
    });
};