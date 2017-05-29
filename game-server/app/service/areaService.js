var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'AreaService');
var EventEmitter = require('events').EventEmitter;
var bearcat = require('bearcat');
var pomelo = require('pomelo');
var schedule = require('node-schedule');
var Answer = require('../../../shared/answer');
var Code = require('../../../shared/code');

var AreaService = function() {
  this.id = 0;
  this.width = 0;
  this.height = 0;
  this.tickCount = 0; // player score rank
  this.countdownCount = 0;
  this.added = []; // the added entities in one tick
  this.reduced = []; // the reduced entities in one tick
  this.players = {};
  this.trusteePlayers = {};
  this.entities = {};
  this.channel = null;
  this.actionManagerService = null;
  this.lotteryManagerService = null;
  this.consts = null;
  this.globalEntityId = 0;
  this.platformTypeBet = new Map();
};

/**
 * Init areas
 * @param {Object} opts
 * @api public
 */
AreaService.prototype.init = function() {
  var opts  = this.dataApiUtil.area().findById(1);
  this.id = opts.id;
  this.generateGlobalLottery();
  this.lotteryManagerService.init(this);
  //area run
  this.run();

  schedule.scheduleJob('0 2 0 * * *', this.incomeScheduleTask.bind(this));
};

AreaService.prototype.run = function() {
  setInterval(this.tick.bind(this), 100);
}

AreaService.prototype.tick = function() {
  //run all the action
  return;
  this.actionManagerService.update();
  this.entityUpdate();
  this.rankUpdate();
  this.countdown();
};

AreaService.prototype.incomeScheduleTask = function () {
    //bearcat.getBean("calcIncome")
    this.calcIncome.calc();
};

AreaService.prototype.convertParseToJson = function (openInfo) {
    var parseResult = {};
    parseResult.totalSizeResult = openInfo.totalSizeResult;
    parseResult.totalSingleDoubleResult = openInfo.totalSingleDoubleResult;

    parseResult.dragonAndTigerResult = [];
    if(openInfo.dragonAndTigerResult){
        for (let item of openInfo.dragonAndTigerResult){
            parseResult.dragonAndTigerResult.push(item);
        }
    }

    parseResult.equal15Result = openInfo.equal15Result;
    parseResult.perPosSizeSingleDoubleResult = [];
    if(openInfo.perPosSizeSingleDoubleResult){
        for (let item of openInfo.perPosSizeSingleDoubleResult){
            parseResult.perPosSizeSingleDoubleResult.push(item);
        }
    }

    parseResult.perPosValueResult = [];
    if(openInfo.perPosValueResult){
        for (let item of openInfo.perPosValueResult){
            parseResult.perPosValueResult.push(item);
        }
    }


    parseResult.containValueResult = [];
    if(openInfo.containValueResult){
        for (let item of openInfo.containValueResult){
            parseResult.containValueResult.push(item);
        }
    }

    parseResult.pantherResult = [];
    for (let item of openInfo.pantherResult){
        parseResult.pantherResult.push(item);
    }
    parseResult.shunZiResult = [];
    if(openInfo.shunZiResult){
        for (let item of openInfo.shunZiResult){
            parseResult.shunZiResult.push(item);
        }
    }

    return parseResult;
}

AreaService.prototype.openLottery = function (numbers, period, opentime) {

  var paserResult = {numbers:numbers,period:period, opentime:opentime};
  var openInfo = this.calcOpenLottery.calc(numbers);
    paserResult.parseResult = this.convertParseToJson(openInfo);

  this.getLottery().publishParseResult(paserResult);

  for(var id in this.players){
      this.getEntity(this.players[id]).openTheLottery(openInfo);
  }

  for (var id in this.trusteePlayers){
      this.trusteePlayers[id].openTheLottery(openInfo);
  }

  this.trusteePlayers = null;
};

AreaService.prototype.canBetPlatform = function (type, value) {
    var num = this.platformTypeBet.get(type);
    var newNum = (!!num ? num:0) + value;

    var err = {};
    var freeBetValue = 0;
    if(this.betLimitCfg.platformLimit(type, newNum)){
        freeBetValue = this.betLimitCfg.getPlatfromValue(type) - num;
        err = Code.GAME.FA_BET_PLATFORM_LIMIT;
    }
    else {
      freeBetValue = this.betLimitCfg.getPlatfromValue(type) - newNum;
      err = Code.OK;
    }

    return new Answer.DataResponse(err, {freeBetValue:freeBetValue});
};

AreaService.prototype.addPlatfromBet = function (type, value) {
    var num = this.platformTypeBet.get(type.code);
    var newNum = (!!num?num:0) + value;
    this.platformTypeBet.set(type.code, newNum);

};

AreaService.prototype.reducePlatfromBet = function (type, value) {
    var num = this.platformTypeBet.get(type.code);
    var newNum = (!!num?num:0) - value;
    if(newNum < 0){
        logger.error('reducePlatfromBet < 0');
        return;
    }
    this.platformTypeBet.set(type.code, newNum);
};

AreaService.prototype.addAction = function(action) {
  return this.actionManager().addAction(action);
};

AreaService.prototype.abortAction = function(type, id) {
  return this.actionManager().abortAction(type, id);
};

AreaService.prototype.abortAllAction = function(id) {
  return this.actionManager().abortAllAction(id);
};

AreaService.prototype.getChannel = function() {
  if (this.channel) {
    return this.channel;
  }

  this.channel = pomelo.app.get('channelService').getChannel('area_' + this.id, true);
  return this.channel;
};

AreaService.prototype.entityUpdate = function() {
  if (this.reduced.length > 0) {
    this.getChannel().pushMessage(this.consts.Event.area.removeEntities,{entities: this.reduced});
    this.reduced = [];
  }

  if (this.added.length > 0) {
    var added = this.added;
    var r = [];
    for (var i = 0; i < added.length; i++) {
      r.push(added[i].strip());
    }

    this.getChannel().pushMessage(this.consts.Event.area.addEntities,{entities: r});
    this.added = [];
  }
};
/**
 * Add entity to area
 * @param {Object} e Entity to add to the area.
 */
AreaService.prototype.addEntity = function(e) {
  if (!e || !e.entityId) {
    return false;
  }

  //todo should add after filter
  ++e.loginCount;
  e.lastOnlineTime = Date.now();
  e.save();

  this.entities[e.entityId] = e;
  this.eventManager.addEvent(e);

  if (e.type === this.consts.EntityType.PLAYER) {
    this.getChannel().add(e.id, e.serverId);

    if (!!this.players[e.id]) {
      logger.error('add player twice! player : %j', e);
    }
    this.players[e.id] = e.entityId;

    this.getLottery().publishCurLottery([{uid:e.id, sid:e.serverId}]);
  }

  this.added.push(e);
  return true;
};


AreaService.prototype.rankUpdate = function() {
  this.tickCount++;
  if (this.tickCount >= 10) {
    this.tickCount = 0;
      this.getLottery().publishNotice();

   //  var player = this.getAllPlayers();
   //  player.sort(function(a, b) {
   //    return a.score < b.score;
   //  });
   //  var ids = player.slice(0, 10).map(function(a) {
   //    return a.entityId;
   //  });
   //
   // //   channel.pushMessage(this.consts.Event.chat.chatMessage, msg, cb);
   //  this.getChannel().pushMessage('rankUpdate', {
   //    route: 'rankUpdate',
   //    entities: ids
   //  },{},function (err, res) {
   //      console.log('sdfdsfdsf');
   //  });
  }
};

/**
 * The lottery countdown
 */
AreaService.prototype.countdown = function () {

//    logger.error('AreaService.prototype.generateGlobalLottery:',this.getLottery());
    if(this.countdownCount >= 5){
        this.getLottery().countdown();
        this.countdownCount = 0;
    }
    this.countdownCount++;

}

/**
 *
 */
AreaService.prototype.lotteryResult = function () {
    
}

/**
 * Remove Entity form area
 * @param {Number} entityId The entityId to remove
 * @return {boolean} remove result
 */
AreaService.prototype.removeEntity = function(entityId) {
  var e = this.entities[entityId];
  if (!e) {
    return true;
  }

  if (e.type === this.consts.EntityType.PLAYER) {
    this.getChannel().leave(e.id, e.serverId);
    this.actionManagerService.abortAllAction(entityId);

    delete this.players[e.id];
  }

  delete this.entities[entityId];
  this.reduced.push(entityId);
  return true;
};

/**
 * Get entity from area
 * @param {Number} entityId.
 */
AreaService.prototype.getEntity = function(entityId) {
  return this.entities[entityId];
};

/**
 * Get entities by given id list
 * @param {Array} The given entities' list.
 */
AreaService.prototype.getEntities = function(ids) {
  var result = [];
  for (var i = 0; i < ids.length; i++) {
    var entity = this.entities[ids[i]];
    if (entity) {
      result.push(entity);
    }
  }

  return result;
};

AreaService.prototype.getAllPlayers = function() {
  var _players = [];
  var players = this.players;
  for (var id in players) {
    _players.push(this.entities[players[id]]);
  }

  return _players;
};

AreaService.prototype.generateGlobalLottery = function() {
  var lotteryData = this.dataApiUtil.lottery().data;
  var t = bearcat.getBean('lottery', {
      kindId: lotteryData["1"].id,
      kindName: lotteryData["1"].name,
      imgId: lotteryData["1"].imgId,
  });
  logger.error('``````````````````````````',t);
  t.areaService = this;
  this.globalEntityId = t.entityId;
  this.addEntity(t);
};

AreaService.prototype.getLottery = function () {
    return this.entities[this.globalEntityId];
}

AreaService.prototype.getAllEntities = function() {
  var r = {};
  var entities = this.entities;

  for (var id in entities) {
    r[id] = entities[id].toJSON();
  }

  return r;
  // return this.entities;
};

AreaService.prototype.getPlayer = function(playerId) {
  var entityId = this.players[playerId];
  return this.entities[entityId];
};

AreaService.prototype.removePlayer = function(playerId) {
  var entityId = this.players[playerId];

  if (entityId) {
    delete this.players[playerId];
    this.removeEntity(entityId);
  }
};

/**
 * Get area entities for given postion and range.
 */
AreaService.prototype.getAreaInfo = function() {
  var entities = this.getAllEntities();
  return {
    id: this.id,
    entities: entities,
    width: this.width,
    height: this.height
  };
};

AreaService.prototype.entities = function() {
  return this.entities;
};

AreaService.prototype.actionManager = function() {
  return this.actionManagerService;
};

module.exports = {
  id: "areaService",
  func: AreaService,
  props: [{
    name: "actionManagerService",
    ref: "actionManagerService"
  },{
    name:"lotteryManagerService",
    ref:"lotteryManagerService"
  },{
    name: "dataApiUtil",
    ref: "dataApiUtil"
  }, {
    name: "consts",
    ref: "consts"
  }, {
    name: "eventManager",
    ref: "eventManager"
  }, {
    name: "calcOpenLottery",
    ref: "calcOpenLottery"
  }, {
    name: "betLimitCfg",
    ref: "betLimitCfg"
  }, {
    name: "calcIncome",
    ref: "calcIncome"
  }]
}