var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'PlayerHandler');
var bearcat = require('bearcat');
var fs = require('fs');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');

// 非常荣幸您选择我们作为您的开奖数据供应商！
// 您的数据账号：33C9381371DE3848
//
// 您的校验密码：ED10513DF478
//
// 快速管理地址：http://face.opencai.net?token=33c9381371de3848&verify=ed10513df478
//
//     自助管理平台：(即将上线)

var PlayerHandler = function (app) {
    this.app = app;
    this.consts = null;
    this.areaService = null;
};

/**
 * Player enter scene, and response the related information such as
 * playerInfo, areaInfo and mapData to client.
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
PlayerHandler.prototype.enterGame = function (msg, session, next) {

    var playerId = session.uid;

    var self = this;

    this.daoUser.getPlayerAllInfo(playerId, function (err, player) {
        if (err || !player) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_PLAYER_INFO_ERROR));
            return;
        }
        player.serverId = session.frontendId;
        player.areaService = self.areaService;
        if (!self.areaService.addEntity(player)) {
            next(null, new Answer.NoDataResponse(Code.GAME.FA_ADD_ENTITY_ERROR));
            return;
        }

        next(null, new Answer.DataResponse(Code.OK, {
            area: self.areaService.getAreaInfo(),
            player:player.strip()
        }));
    });
};

PlayerHandler.prototype.setRoleName = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setRoleName(msg.roleName);

    var action = bearcat.getBean('rename', {
        entity: player,
        roleName: msg.roleName,
    });

    this.areaService.addAction(action);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setPinCode = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setPinCode(msg.roleName);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.getLotterys = function (msg, session, next) {
    var lottery =  this.areaService.getLottery();
    lottery.getLotterys(msg.skip, msg.limit, function (err, result) {
        if(!!err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_LOTTERY_INFO_ERROR));
        }else {
            next(null, new Answer.DataResponse(Code.OK, result));
        }
    });
};
/**
 * lottery bet
 * @param msg
 * @param session
 * @param next
 */
PlayerHandler.prototype.bet = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);

    var period = this.areaService.getLottery().getNextPeriod();
    var identify = this.areaService.getLottery().getIdentify();

    var betParseInfo = msg.betParseInfo;
    betParseInfo.betData = msg.betData;
    player.bet(period, identify, betParseInfo, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

/**
 * cancle lottery bet
 * @param msg
 * @param session
 * @param next
 */
PlayerHandler.prototype.unBet = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);

    player.unBet(player.entityId, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

/**
 * Player moves. Player requests move with the given movePath.
 * Handle the request from client, and response result to client
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
PlayerHandler.prototype.move = function (msg, session, next) {
    var endPos = msg.targetPos;
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    if (!player) {
        logger.error('Move without a valid player ! playerId : %j', playerId);
        next(new Error('invalid player:' + playerId), {
            code: this.consts.MESSAGE.ERR
        });
        return;
    }

    var target = this.areaService.getEntity(msg.target);
    player.target = target ? target.entityId : null;

    if (endPos.x > this.areaService.getWidth() || endPos.y > this.areaService.getHeight()) {
        logger.warn('The path is illigle!! The path is: %j', msg.path);
        next(new Error('fail to move for illegal path'), {
            code: this.consts.MESSAGE.ERR
        });

        return;
    }

    var action = bearcat.getBean('move', {
        entity: player,
        endPos: endPos,
    });

    if (this.areaService.addAction(action)) {
        next(null, {
            code: this.consts.MESSAGE.RES,
            sPos: player.getPos()
        });

        this.areaService.getChannel().pushMessage({
            route: 'onMove',
            entityId: player.entityId,
            endPos: endPos
        });
    }
};

/**
 * Player pick up item.
 * Handle the request from client, and set player's target
 *
 * @param {Object} msg
 * @param {Object} session
 * @param {Function} next
 * @api public
 */
PlayerHandler.pickItem = function(msg, session, next) {
    var area = session.area;

    var player = area.getPlayer(session.uid);
    var target = area.getEntity(msg.targetId);
    if(!player || !target || (target.type !== consts.EntityType.ITEM && target.type !== consts.EntityType.EQUIPMENT)){
        next(null, {
            route: msg.route,
            code: consts.MESSAGE.ERR
        });
        return;
    }

    player.target = target.entityId;

    // next();
    next(null, {});
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "playerHandler",
        func: PlayerHandler,
        args: [{
            name: "app",
            value: app
        }],
        props: [{
            name: "areaService",
            ref: "areaService"
        }, {
            name: "dataApiUtil",
            ref: "dataApiUtil"
        }, {
            name: "consts",
            ref: "consts"
        }, {
            name: "daoUser",
            ref: "daoUser"
        }]
    });
};