var bearcat = require('bearcat');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');
var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);

var PlayerRemote = function (app) {
    this.app = app;
    this.utils = null;
    this.consts = null;
    this.areaService = null;
}

PlayerRemote.prototype.playerJoin = function (playerId, serverId, cb) {
    var self = this;
    this.daoUser.getPlayerAllInfo(playerId, function (err, player) {
        if (err || !player) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_QUERY_PLAYER_INFO_ERROR), null);
            return;
        }
        player.serverId = serverId;
        player.areaService = self.areaService;

        var existPlayer = self.areaService.getPlayer(playerId);
        if (existPlayer) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_USER_AREADY_LOGIN), null);
            return;
        }

        if (!self.areaService.addEntity(player)) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_ADD_ENTITY_ERROR), null);
            return;
        }

        // next(null, new Answer.DataResponse(Code.OK, player.strip()));
        self.utils.invokeCallback(cb, null, new Answer.DataResponse(Code.OK, player.strip()));

        // 服务器异常，造成投注异常数据（未开奖数据）
//        player.restoreExceptBet();
    });
};

PlayerRemote.prototype.playerLeave = function (playerId, cb) {
    var player = this.areaService.getPlayer(playerId);
    if (!player) {
        this.utils.invokeCallback(cb);
        return;
    }
    this.areaService.removePlayer(playerId);
    this.areaService.getChannel().pushMessage({
        route: 'onUserLeave',
        code: this.consts.MESSAGE.RES,
        playerId: playerId
    });
    this.utils.invokeCallback(cb);
};

// 后台管理员充值
PlayerRemote.prototype.recharge = function (uid, money, cb) {
    var self = this;
    this.daoUser.updateAccountAmount(uid, money, function (err, success) {
        if (!!err || !success) {
            self.utils.invokeCallback(cb, '充值失败', new Answer.NoDataResponse(Code.GAME.FA_RECHARGE_UID_ERROR));
            return;
        }
        self.daoRecord.add(uid, money, self.consts.RecordType.RECHARGE, self.consts.RecordOperate.OPERATE_OK);
        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));

        //在线用户及时到帐
        var player = self.areaService.getPlayer(uid);
        if (!!player) {
            player.recharge(money);
        }
    })
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
        var player = self.areaService.getPlayer(uid);
        if (!!player) {
            player.recharge(money);
        }
    })
};

// 后台管理员提现确认
PlayerRemote.prototype.cashHandler = function (uid, orderId, operate, cb) {
    var self = this;
    async.waterfall([
        function (scb) {
            self.daoRecord.getRecord(orderId, scb);
        },
        function (record, scb) {
            if(operate === self.consts.RecordOperate.OPERATE_ABORT){
                self.restoreMoney(uid, record.num, function (err, resutl) {
                    if(err){
                        scb(err);
                    }
                    else {
                        scb();
                    }
                });
            }else {
                scb();
            }
        },
        function (scb) {
            self.daoRecord.setOperate(orderId, operate, scb);
        }
    ], function (err) {
        if (err) {
            self.utils.invokeCallback(cb, err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        self.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
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

PlayerRemote.prototype.playerCtrl = function (uid, ctrl, cb) {
    var player = this.areaService.getPlayer(uid);
    switch (Number(ctrl.code)) {
        case this.consts.PlayerCtrl.forbidTalk:
            if (!!player) {
                player.setCanTalk(ctrl.operate);
            }
            else {
                this.daoUser.setPlayerCanTalk(uid, ctrl.operate);
            }
            this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
            return;
        case this.consts.PlayerCtrl.active:
            this.daoUser.setPlayerActive(uid, ctrl.operate);
            this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
            return;
        default:
            break;
    }

    this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.FAIL));
};

PlayerRemote.prototype.getPlayerBaseInfo = function (uid, cb) {
    var player = this.areaService.getPlayer(uid);
    if (!!player) {
        this.utils.invokeCallback(cb, null, player.getBaseInfo());
        return;
    }

    var self = this;
    this.daoUser.getPlayerAllInfo(uid, function (err, _player) {
        if (err || !_player) {
            self.utils.invokeCallback(cb, Code.GAME.FA_QUERY_PLAYER_INFO_ERROR, null);
            return;
        }
        self.utils.invokeCallback(cb, null, _player.getBaseInfo());
    });
}

module.exports = function (app) {
    return bearcat.getBean({
        id: "playerRemote",
        func: PlayerRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [{
            name: "areaService",
            ref: "areaService"
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