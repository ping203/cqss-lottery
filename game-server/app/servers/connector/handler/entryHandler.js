var Code = require('../../../../../shared/code');
var async = require('async');
var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger(__filename);
var random_name = require('node-random-name')


var EntryHandler = function (app) {
    this.app = app;
    this.serverId = app.get('serverId').split('-')[2];
};

EntryHandler.prototype.createPlayer = function(userId, cb) {
    var self = this;
    this.daoUser.getPlayersByUid(userId, function(err, players) {
        if (players && players.length > 0) {
            self.utils.invokeCallback(cb, null, players[0]);
            return;
        }

        var uid = userId, sex = 0,roleName = random_name();
        self.daoUser.createPlayer(uid, roleName, sex, function(err, players){
            if(err) {
                logger.error('[register] fail to invoke createPlayer for ' + err.stack);
                self.utils.invokeCallback(cb, err, null);
            }else{
                self.utils.invokeCallback(cb, null, players[0]);
            }
        });
    });
};

/**
 * New client entry game server. Check token and bind user info into session.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
EntryHandler.prototype.entry = function (msg, session, next) {
    var token = msg.token, self = this;
    if (!token) {
        next(new Error('invalid entry request: empty token'), {code: Code.FAIL});
        return;
    }

    var _player, _user;
    async.waterfall([
        function (cb) {
            // auth token
            self.app.rpc.auth.authRemote.auth(session, token, cb);
        }, function (code, user, cb) {
            // query player info by user id
            if (code !== Code.OK) {
                next(null, {code: code});
                return;
            }
            if (!user) {
                next(null, {code: Code.ENTRY.FA_USER_NOT_EXIST});
                return;
            }
            self.daoUser.getPlayersByUid(user.id, cb);
            _user = user;
        }, function (res, cb) {
            // generate session and register chat status
            players = res;
            self.app.get('sessionService').kick(_user.id, cb);
        }, function (cb) {
            session.bind(_user.id, cb);
        }, function (cb) {
            self.createPlayer(_user.id, cb);
        },
        function (player, cb) {
            _player = player;
            // session.set('areaId', self.app.get('areaIdMap')[player.areaId]);
            session.set('areaId', 1);
            session.set('roleName', _player.roleName);
            session.set('playerId', _player.id);
            session.on('closed', onUserLeave.bind(null, self.app));
            session.pushAll(cb);
        }
    ], function (err) {
        if (err) {
            next(err, {code: Code.FAIL});
            return;
        }
        next(null, {code: Code.OK, response:{player: _player, user:_user}});
    });
};

var onUserLeave = function (app, session, reason) {
    if (session && session.uid) {
        app.rpc.area.playerRemote.playerLeave(session, {
            playerId: session.get('playerId'),
            areaId: session.get('areaId')
        }, null);

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