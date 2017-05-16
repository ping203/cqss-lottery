var bearcat = require('bearcat');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');
var async = require('async');

var PlayerRemote = function(app) {
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
        if(existPlayer){
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_USER_AREADY_LOGIN), null);
            return;
        }

        if (!self.areaService.addEntity(player)) {
            self.utils.invokeCallback(cb, new Answer.NoDataResponse(Code.GAME.FA_ADD_ENTITY_ERROR), null);
            return;
        }

        // next(null, new Answer.DataResponse(Code.OK, player.strip()));
        self.utils.invokeCallback(cb, null, new Answer.DataResponse(Code.OK, player.strip()));
    });
};

PlayerRemote.prototype.playerLeave = function(playerId, cb) {
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

PlayerRemote.prototype.recharge = function (uid, money,cb) {
    var player = this.areaService.getPlayer(uid);
    if (player) {
        player.recharge(money);
        this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
        return;
    }

    //离线用户充值
    this.daoUser.updateAccountAmount(uid, money, function (err, success) {
        if(!!err || !success){
            this.utils.invokeCallback(cb,'充值失败', new Answer.NoDataResponse(Code.GAME.FA_RECHARGE_UID_ERROR));
            return;
        }

        this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
    })
}

PlayerRemote.prototype.cast = function (uid, money, cb) {
    var player = this.areaService.getPlayer(uid);
    if (player) {
        if(!player.cast(money)){
            this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.GAME.FA_CAST_ERROR));
        }
        else {
            this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
        }
        return;
    }

    //离线用户提现
    async.waterfall([
        function (callback) {
            this.daoUser.getAccountAmount(uid, callback);
        },
        function (amount, callback) {
            if(amount > money){
                this.daoUser.updateAccountAmount(uid, -money, callback);
            }
            else {
                this.utils.invokeCallback(cb, '提现失败', new Answer.NoDataResponse(Code.GAME.FA_CAST_ERROR));
            }
        },function (success, callback) {
            if(!success){
                cb('提现失败');
            }else {
                cb();
            }
        }
    ],function (err) {
        if(err){
            this.utils.invokeCallback(cb, err, new Answer.NoDataResponse(Code.FAIL));
            return;
        }
        this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
    });
}

PlayerRemote.prototype.setConfig = function (configs,cb) {
	//check config invalid
	this.sysConfig.setConfigs(configs);
    this.utils.invokeCallback(cb, null, new Answer.NoDataResponse(Code.OK));
}

module.exports = function(app) {
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
        }]
	});
};