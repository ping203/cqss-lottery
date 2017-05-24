var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'AreaService');
var EventEmitter = require('events').EventEmitter;
var bearcat = require('bearcat');
var pomelo = require('pomelo');

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
  this.platformTypeBet = {};
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

AreaService.prototype.openLottery = function (numbers) {

  var openInfo = this.calcOpenLottery.calc(numbers);

  for(var id in this.players){
      this.players[id].openTheLottery(openInfo);
  }

  for (var id in this.trusteePlayers){
      this.trusteePlayers[id].openTheLottery(openInfo);
  }

  this.trusteePlayers = null;
};

AreaService.prototype.canBetPlatform = function (type, value, err) {
    var num = this.platformTypeBet.get(type);
    var newNum = (!!num ? num:0) + value;

    if(this.betLimit.platformLimit(type, newNum)){
        var canBetValue = this.betLimit.getPlatfromValue(type) - num;
        err.code = Code.GAME.FA_BET_PLATFORM_LIMIT.code;
        err.desc = Code.GAME.FA_BET_PLATFORM_LIMIT.desc + '最多还能下注'+canBetValue;
        return false;
    }

    return true;
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
    this.getChannel().add(e.userId, e.serverId);

    if (!!this.players[e.id]) {
      logger.error('add player twice! player : %j', e);
    }
    this.players[e.id] = e.entityId;

    this.getLottery().publishCurLottery([{uid:e.userId, sid:e.serverId}]);
  }

  this.added.push(e);
  return true;
};


AreaService.prototype.rankUpdate = function() {
  this.tickCount++;
  if (this.tickCount >= 10) {
    this.tickCount = 0;

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
    this.getChannel().leave(e.userId, e.serverId);
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
    name: "betLimit",
    ref: "betLimit"
  }]
}