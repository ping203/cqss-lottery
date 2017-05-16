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
        next(new Error('invalid entry request: empty token'),new Answer.NoDataResponse(Code.PARAMERROR));
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

    app.rpc.area.playerRemote.recharge(session, msg.uid, money, function (err, result) {
        next(err, result);
    });
};

EntryHandler.prototype.cash = function (msg, session, next) {
    if(!msg.money || !msg.uid){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var money = parseInt(msg.money, 10);
    if(isNaN(money)){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    app.rpc.area.playerRemote.cash(session, msg.uid, money, function (err, result) {
        next(err, result);
    });
};

EntryHandler.prototype.setConfig = function (msg, session, next) {
    app.rpc.area.playerRemote.setConfig(session, msg.configs, function (err, result) {
        next(err, result);
    });
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
        },
        function (cb) {
            session.bind(_player.id, cb);
        },function (cb) {
            session.set('roleName', _player.roleName);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        },function (cb) {
            self.app.rpc.area.playerRemote.playerJoin(session, _player.id, session.frontendId, cb);
        },function (playerJoinResult, cb) {
            if(playerJoinResult.result.code != Code.OK.code){
                cb(playerJoinResult.result);
            }
            else {
                _playerJoinResult = playerJoinResult;
                cb();
            }
        }
    ], function (err) {
        if (err) {
            next(err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        next(null, _playerJoinResult);
    });
};

EntryHandler.prototype.logout = function (msg, session, next) {
    onUserLeave(this.app, session, '用户主动推出');
};

var onUserLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.rpc.area.playerRemote.playerLeave(session, session.uid, null);

        app.rpc.chat.chatRemote.kick(session, session.uid, session.get('roomId'),null);
    }
};

var onAdminLeave = function (app, session, reason) {
    if (session && session.uid) {
        self.app.get('sessionService').kick(session.uid, cb);
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
            {name:"utils", ref:"utils"}
        ]
    });
};