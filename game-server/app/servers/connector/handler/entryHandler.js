var Code = require('../../../../../shared/code');
var async = require('async');
var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger(__filename);
var random_name = require('node-random-name')
var Answer = require('../../../../../shared/answer');

var EntryHandler = function (app) {
    this.app = app;
    this.serverId = app.get('serverId').split('-')[2];
};


EntryHandler.prototype.login = function (msg, session, next) {
    var token = msg.token, self = this;
    if (!token) {
        next(new Error('invalid entry request: empty token'),new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    var _player;
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
        }
    ], function (err) {
        if (err) {
            next(err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, {player: _player.strip()}));
    });
};

var onUserLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.rpc.area.playerRemote.playerLeave(session, session.uid, null);

        app.rpc.chat.chatRemote.kick(session, session.uid, session.get('roomId'),null);
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