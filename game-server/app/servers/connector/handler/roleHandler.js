var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);
var async = require('async');
var bearcat = require('bearcat');
var randomName  = require("chinese-random-name");
var random_name = require('node-random-name');


var RoleHandler = function(app) {
	this.app = app;
};

RoleHandler.prototype.createPlayer = function(msg, session, next) {
	var uid = session.uid, sex = msg.sex, roleName = msg.roleName || random_name();
	var self = this;

	this.daoUser.getPlayersByUid(uid, function(err, player) {
		if (player) {
            afterLogin(self.app, msg, session, {id: uid}, player.strip(), next);
			return;
		}

        self.daoUser.createPlayer(uid, roleName, sex, function(err, player){
			if(err) {
				logger.error('[register] fail to invoke createPlayer for ' + err.stack);
				next(null, {code: this.consts.MESSAGE.ERR, error:err});
				return;
			}else{
                afterLogin(self.app, msg, session, {id: uid}, player.strip(), next);
			}
		});
	});
};

var afterLogin = function (app, msg, session, user, player, next) {
	async.waterfall([
		function(cb) {
			session.bind(user.id, cb);
		}, 
		function(cb) {
			session.set('username', user.name);
			session.set('areaId', player.areaId);
			session.set('serverId', app.get('areaIdMap')[player.areaId]);
			session.set('playername', player.name);
			session.set('playerId', player.id);
			session.on('closed', onUserLeave);
			session.pushAll(cb);
		}, 
		function(cb) {
			app.rpc.chat.chatRemote.add(session, user.id, player.name, channelUtil.getGlobalChannelName(), cb);
		}
	], 
	function(err) {
		if(err) {
			logger.error('fail to select role, ' + err.stack);
			next(null, {code: this.consts.MESSAGE.ERR});
			return;
		}
		next(null, {code: this.consts.MESSAGE.RES, user: user, player: player});
	});
};

var onUserLeave = function (session, reason) {
	if(!session || !session.uid) {
		return;
	}

	utils.myPrint('2 ~ OnUserLeave is running ...');
	var rpc= pomelo.app.rpc;
	rpc.area.playerRemote.playerLeave(session, {playerId: session.uid, areaId: session.get('areaId')}, null);
	rpc.chat.chatRemote.kick(session, session.uid, null);
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "roleHandler",
        func: RoleHandler,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name:"daoUser", ref:"daoUser"},
            {name:"consts", ref:"consts"},
            {name:"utils", ref:"utils"},
        ]
    });
};
