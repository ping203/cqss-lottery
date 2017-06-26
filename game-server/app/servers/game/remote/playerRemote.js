var bearcat = require('bearcat');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

var PlayerRemote = function (app) {
    this.app = app;
    this.utils = null;
    this.consts = null;
    this.gameService = null;
}

// { main: '/media/linyng/402A1D572A1D4AF4/develop/project/lottery/game-server/app.js',
//     env: 'development',
//     id: 'game-server-1',
//     host: '127.0.0.1',
//     port: 3250,
//     gameId: 1,
//     args: '--inspect=10012',
//     serverType: 'game' }

PlayerRemote.prototype.playerJoin = function (playerId, serverId, cb) {
    logger.error('game:',this.app.getCurServer());
    var self = this;
    this.daoUser.getPlayerAllInfo(playerId, function (err, player) {
        if (err || !player) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_QUERY_PLAYER_INFO_ERROR), null);
            return;
        }
        player.serverId = serverId;
        player.gameService = self.gameService;

        var existPlayer = self.gameService.getPlayer(playerId);
        if (existPlayer) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_USER_AREADY_LOGIN), null);
            return;
        }

        if (!self.gameService.addEntity(player)) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_ADD_ENTITY_ERROR), null);
            return;
        }

        self.utils.invokeCallback(cb, null, new Answer.DataResponse(Code.OK, {player:player.strip(), gameId:self.app.getCurServer().gameId}));
    });
};

PlayerRemote.prototype.playerLeave = function (playerId, cb) {
    var player = this.gameService.getPlayer(playerId);
    if (!player) {
        this.utils.invokeCallback(cb);
        return;
    }
    this.gameService.removePlayer(playerId);
    this.gameService.getChannel().pushMessage({
        route: 'onUserLeave',
        code: this.consts.MESSAGE.RES,
        playerId: playerId
    });
    this.utils.invokeCallback(cb);
};

// 后台管理员充值,事务回滚
PlayerRemote.prototype.recharge = function (uid, money, operator, bankInfo, cb) {
    var self = this;
    async.waterfall([
        function (callback) {
            self.daoUser.updateAccountAmount(uid, money,callback);
        },
        function (ret, callback) {
            self.daoUser.getAccountAmount(uid, callback);
        },
        function (freeMoney, callback) {
            self.daoRecord.add(uid, money, self.consts.RecordType.RECHARGE, self.consts.RecordOperate.OPERATE_OK, freeMoney, operator, bankInfo, callback);
            //在线用户及时到帐
            let player = self.gameService.getPlayer(uid);
            if (!!player) {
                player.recharge(money);
                player.defineNotify(self.consts.MsgNotifyType.RECHARGE, {money:money});
            }
        }
    ],function (err) {
        if(err){
            self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.GAME.FA_RECHARGE_ERROR));
            return;
        }
        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
    });
};

// 拒绝提现，恢复到账户
PlayerRemote.prototype.restoreMoney = function (uid, money, cb) {
    var self = this;
    this.daoUser.updateAccountAmount(uid, money, function (err, success) {
        if (!!err || !success) {
            self.utils.invokeCallback(cb, '退款失败', new Answer.NoDataResponse(Code.GAME.FA_RECHARGE_UID_ERROR));
            return;
        }

        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
        //在线用户及时到帐
        var player = self.gameService.getPlayer(uid);
        if (!!player) {
            player.recharge(money);
            player.defineNotify(self.consts.MsgNotifyType.CASHFAIL, {money:money});
        }
    })
};

// 后台管理员提现确认
PlayerRemote.prototype.cashHandler = function (uid, orderId, status, operator, bankInfo, cb) {
    let self = this;
    let _money = 0;
    async.waterfall([
        function (scb) {
            self.daoRecord.getRecord(orderId, scb);
        },
        function (record, scb) {
            _money = record.num;
            if(status === self.consts.RecordOperate.OPERATE_ABORT){
                if(record.status !== self.consts.RecordOperate.OPERATE_REQ){
                    scb('订单异常操作');
                }
                else {
                    self.restoreMoney(uid, record.num, function (err, resutl) {
                        if(err){
                            scb(err);
                        }
                        else {
                            scb();
                        }
                    });
                }
            }else {
                scb();
            }
        },
        function (scb) {
            self.daoRecord.setOperate(orderId, status, operator, bankInfo, scb);
        }
    ], function (err) {
       // logger.error('cashHandler 管理员充值 操作',uid, orderId, operate);
        if (err) {
            self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));

        var player = self.gameService.getPlayer(uid);
        if (!!player) {
            player.defineNotify(self.consts.MsgNotifyType.CASHOK, {money:_money});
        }
    });
};

PlayerRemote.prototype.setConfig = function (configs, cb) {
    var confs;
    try {
        confs = JSON.parse(configs);
    } catch (e) {
        this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    //check config invalid
    var self = this;
    this.daoConfig.updateConfig(confs, function (err, success) {
        if (!!err || !success) {
            logger.error('updateConfig err:', err);
            self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
        self.sysConfig.setConfigs(confs);
    });
};

//{"uid":"2","ctrl":{"code":1,"operate":false}}
PlayerRemote.prototype.playerCtrl = function (uid, ctrl, cb) {
    var player = this.gameService.getPlayer(uid);
    let self = this;
    switch (Number(ctrl.code)) {
        case this.consts.PlayerCtrl.forbidTalk:
            if (!!player) {
                player.setCanTalk(ctrl.operate);
            }
            else {
                this.daoUser.setPlayerCanTalk(uid, ctrl.operate, function (err, result) {
                    if(result){
                        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
                    }else {
                        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.DBFAIL));
                    }
                });
            }
            return;
        case this.consts.PlayerCtrl.active:
            this.daoUser.setPlayerActive(uid, ctrl.operate, function (err, result) {
                if(result){
                    self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
                }
                else {
                    self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.DBFAIL));
                }
            });
            return;
        default:
            this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.FAIL));
            break;
    }
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "playerRemote",
        func: PlayerRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [{
            name: "gameService",
            ref: "gameService"
        }, {
            name: "utils",
            ref: "utils"
        }, {
            name: "consts",
            ref: "consts"
        }, {
            name: "daoUser",
            ref: "daoUser"
        }, {
            name: "sysConfig",
            ref: "sysConfig"
        }, {
            name: "daoConfig",
            ref: "daoConfig"
        }, {
            name: "daoRecord",
            ref: "daoRecord"
        }]
    });
};