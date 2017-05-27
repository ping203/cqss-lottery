var bearcat = require('bearcat');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');

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
        }]
	});
};