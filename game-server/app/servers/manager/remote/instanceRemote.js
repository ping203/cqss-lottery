var bearcat = require('bearcat');
var logger = require('pomelo-logger').getLogger(__filename);

var InstanceRemote = function (app) {
    this.app = app;
}

InstanceRemote.prototype.create = function(params, cb){
  logger.error('create server params : %j', params);
  let self = this;
  this.instanceManager.getInstance(params, function(err, result){
    if(err){
      logger.error('create instance error! args : %j, err : %j', params, err);
      self.utils.invokeCallback(cb, err);
    }else{
      self.utils.invokeCallback(cb, null, result);
    }
  });
};

InstanceRemote.prototype.remove = function(id, cb){
  this.instanceManager.remove(id);
  this.utils.invokeCallback(cb, null, id);
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "instanceRemote",
        func: InstanceRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name:"consts", ref:"consts"},
            {name:"utils", ref:"utils"},
            {name:"instanceManager",ref:"instanceManager"}
        ]
    });
};

