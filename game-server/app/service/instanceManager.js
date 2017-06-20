var pomelo = require('pomelo');
var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger(__filename);

var INSTANCE_SERVER = 'area';
//The instance map, key is instanceId, value is serverId
var instances = {};

//All the instance servers
var instanceServers = [];

var InstanceManager = function () {
};

InstanceManager.prototype.addServers = function(servers){
  for(var i = 0; i < servers.length; i++){
    var server = servers[i];

    if(server.serverType === 'area' && server.instance){
      instanceServers.push(server);
    }
  }
};

InstanceManager.prototype.removeServers = function(servers){
  for(var i = 0; i < servers.length; i++){
    var server = servers[i];

    if(server.serverType === 'area' && server.instance){
      this.removeServer(server.id);
    }
  }

  logger.info('remove servers : %j', servers);
};

InstanceManager.prototype.getInstance = function(args, cb){
  //The key of instance
  var instanceId = args.areaId + '_' + args.id;

  //If the instance exist, return the instance
  if(instances[instanceId]){
    this.utils.invokeCallback(cb, null, instances[instanceId]);
    return;
  }

  //Allocate a server id
  var serverId = getServerId();

  //rpc invoke
  var params = {
    namespace : 'user',
    service : 'areaRemote',
    method : 'create',
    args : [{
      areaId : args.areaId,
      instanceId : instanceId
    }]
  };

  var app = pomelo.app;
  app.rpcInvoke(serverId, params, function(err, result){
    if(!!err) {
      console.error('create instance error!');
      this.utils.invokeCallback(cb, err);
      return;
    }

    instances[instanceId] = {
      instanceId : instanceId,
      serverId : serverId
    };

    this.utils.invokeCallback(cb, null, instances[instanceId]);
  });

};

InstanceManager.prototype.remove = function(instanceId){
  if(instances[instanceId]) delete instances[instanceId];
};

//Get the server to create the instance
var count = 0;
function getServerId(){
  if(count >= instanceServers.length) count = 0;

  var server = instanceServers[count];

  count++;
  return server.id;
}

function filter(req){
  var playerId = req.playerId;

  return true;
}

InstanceManager.prototype.removeServer = function(id){
  for(var i = 0; i < instanceServers.length; i++){
    if(instanceServers[i].id === id){
      delete instanceServers[i];
    }
  }
};

module.exports = {
    id: "instanceManager",
    func: InstanceManager,
    props: [{
        name: "utils",
        ref: "utils"
    }, {
        name: "dataApiUtil",
        ref: "dataApiUtil"
    }, {
        name: "consts",
        ref: "consts"
    }]
}