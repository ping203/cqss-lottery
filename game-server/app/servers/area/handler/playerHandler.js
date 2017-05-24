var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'PlayerHandler');
var bearcat = require('bearcat');
var fs = require('fs');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');

var PlayerHandler = function (app) {
    this.app = app;
    this.consts = null;
    this.areaService = null;
};

PlayerHandler.prototype.bet = function (msg, session, next) {
    var period = this.areaService.getLottery().getNextPeriod();
    var identify = this.areaService.getLottery().getIdentify();
    var player = this.areaService.getPlayer(session.uid);
    var parseTypeInfo = msg.betParseInfo;

    var self = this;
    player.bet(period, identify, msg.betData, parseTypeInfo, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }

        for(var type in parseTypeInfo.betTypeInfo){
            self.areaService.addPlatfromBet(type, parseTypeInfo.betTypeInfo[type].money);
        }

        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

PlayerHandler.prototype.unBet = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);

    var self = this;
    player.unBet(player.entityId, function (err, betItem) {
        if(err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }

        var betTypeInfo = betItem.getBetTypeInfo();
        for(var type in betTypeInfo){
            var freeValue = self.areaService.reducePlatfromBet(type, betTypeInfo[type].money);
            betItem.setFreeBetValue(freeValue);
        }

        next(null, new Answer.NoDataResponse(Code.OK));
    });
};

PlayerHandler.prototype.myBets = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyBets(msg.skip, msg.limit, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.myIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyIncomes(msg.skip, msg.limit, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.friendIncome = function (msg, session, next) {
    var player = this.areaService.getPlayer(session.uid);
    player.getMyIncomes(msg.skip, msg.limit, function (err, result) {
        if(err){
            next(null, new Answer.NoDataResponse(Code.GAME.FA_QUERY_INFO_IS_EMPTY));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
};

PlayerHandler.prototype.setRoleName = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setRoleName(msg.roleName);

    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setPinCode = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setPinCode(msg.pinCode);
    next(null, new Answer.NoDataResponse(Code.OK));
};

PlayerHandler.prototype.setImageId = function (msg, session, next) {
    var playerId = session.uid;
    var player = this.areaService.getPlayer(playerId);
    player.setImageId(msg.imageId);
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