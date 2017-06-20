var Code = require('../../../../../shared/code');
var async = require('async');
var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger(__filename);
var Answer = require('../../../../../shared/answer');

var EntryHandler = function (app) {
    this.app = app;
    this.serverId = app.get('serverId').split('-')[2];
};

//管理员登录
EntryHandler.prototype.adminLogin = function (msg, session, next) {
    var token = msg.token, self = this;
    if (!token) {
        next(new Error('invalid entry request: empty token'), new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var _playerId;
    async.waterfall([
        function (cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function (code, playerId, cb) {
            if (code.code !== Code.OK.code) {
                next(null, new Answer.NoDataResponse(code));
                return;
            }
            _playerId = playerId;
            self.app.get('sessionService').kick(playerId, cb);
        },
        function (cb) {
            session.bind(_playerId, cb);
        },function (cb) {
            session.on('closed', onAdminLeave.bind(null, self.app));
            session.pushAll(cb);
        }
    ], function (err) {
        if (err) {
            next(err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        next(err, new Answer.NoDataResponse(Code.OK));
    });
};

// 后台充值
EntryHandler.prototype.recharge = function (msg, session, next) {
    if(!msg.money || !msg.uid){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var money = parseInt(msg.money, 10);
    if(isNaN(money)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    this.app.rpc.game.playerRemote.recharge(session, Number(msg.uid), money, function (err, result) {
        next(err, result);
    });
};

// 后台提现确认
EntryHandler.prototype.cashHandler = function (msg, session, next) {
    if(!msg.uid || !msg.orderId || !msg.operate || !(!!msg.operate && (msg.operate === this.consts.RecordOperate.OPERATE_OK ||
        msg.operate === this.consts.RecordOperate.OPERATE_ABORT))){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    this.app.rpc.game.playerRemote.cashHandler(session, Number(msg.uid), Number(msg.orderId), Number(msg.operate), function (err, result) {
        next(null, result);
    });
};

EntryHandler.prototype.setConfig = function (msg, session, next) {
    if(!msg.configs){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    this.app.rpc.game.playerRemote.setConfig(session, msg.configs, function (err, result) {
        next(err, result);
    });
};

EntryHandler.prototype.playerCtrl = function (msg, session, next) {
    if(!msg.uid || !msg.ctrl){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }
    var self = this;
    switch (Number(msg.ctrl.code)){
        case this.consts.PlayerCtrl.forbidTalk:
            this.app.rpc.chat.chatRemote.userForbidTalk(session, Number(msg.uid), msg.ctrl.operate, next);
            break;
        case this.consts.PlayerCtrl.active:
            if(!msg.ctrl.operate){
                self.app.get('sessionService').kick(Number(msg.uid), '帐号冻结');
            }
            break;
        default:
            break;
    }

    this.app.rpc.game.playerRemote.playerCtrl(session, Number(msg.uid), msg.ctrl, next);
};

EntryHandler.prototype.login = function (msg, session, next) {
    var token = msg.token, self = this;
    if (!token) {
        next(new Error('invalid entry request: empty token'),new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var _player, _playerJoinResult;
    async.waterfall([
        function (cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function (code, playerId, cb) {
            if (code.code !== Code.OK.code) {
                next(null, new Answer.NoDataResponse(code));
                return;
            }
            self.daoUser.getPlayer(playerId, cb);
        },function (player, cb) {
            if (!player) {
                next(null,new Answer.NoDataResponse(Code.USER.FA_USER_NOT_EXIST));
                return;
            }
            _player = player;
            self.app.get('sessionService').kick(_player.id, cb);
        },function (cb) {
            session.bind(_player.id, cb);
        },function (cb) {
            session.set('roleName', _player.roleName);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        },function (cb) {
            self.app.rpc.game.playerRemote.playerJoin(session, _player.id, session.frontendId, cb);
        },function (playerJoinResult, cb) {
            if(playerJoinResult.result.code != Code.OK.code){
                cb(playerJoinResult.result);
            }
            else {
                _playerJoinResult = playerJoinResult.data.player;
                cb(null, playerJoinResult.data.gameId);
            }
        },function (gameId, cb) {
            self.app.rpc.chat.chatRemote.join(session, _player.id, session.frontendId, _player.roleName, gameId, function (result) {
                if(result.code != Code.OK.code){
                    cb('加入聊天服务器失败');
                }
                else {
                    session.set('roomId', gameId);
                    session.push('roomId', cb);
                }
            });
        }
    ], function (err) {
        if (err) {
            logger.error('用户登录失败 err:',err);
            next(err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }

        logger.error('用户登录成功 uid:',session.uid,'name:', session.get('roleName'));
        next(null, new Answer.DataResponse(Code.OK, _playerJoinResult));
    });
};

EntryHandler.prototype.logout = function (msg, session, next) {
    onUserLeave(this.app, session, '用户主动推出');
};

var onUserLeave = function (app, session, reason) {
    if(!session || !session.uid) {
        return;
    }
    app.rpc.game.playerRemote.playerLeave(session, session.uid, null);
    app.rpc.chat.chatRemote.leave(session, session.uid, session.get('roomId'),null);
    logger.error('@@@@@@@@@@@@@@@@@@@@@@用户退出@@@@@@@@@@@@@@@@@@uid:',session.uid,'name:', session.get('roleName'));
};

var onAdminLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.get('sessionService').kick(session.uid, null);
    }
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "entryHandler",
        func: EntryHandler,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name:"daoUser", ref:"daoUser"},
            {name:"dataApiUtil", ref:"dataApiUtil"},
            {name:"utils", ref:"utils"},
            {name:"consts", ref:"consts"},
        ]
    });
};