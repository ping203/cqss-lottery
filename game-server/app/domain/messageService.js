var pomelo = require('pomelo');
var logger = require('pomelo-logger').getLogger(__filename);

var MessageService = function () {
    
};

MessageService.prototype.pushMessageByUids = function (uids, route, msg) {
	pomelo.app.get('channelService').pushMessageByUids(route, msg, uids, errHandler);
};

MessageService.prototype.pushMessageToPlayer = function (uid, route, msg) {
  this.pushMessageByUids([uid], route, msg);
};

MessageService.prototype.pushMessage= function (msg, ignoreList) {
    pomelo.app.get('channelService').broadcast();
  // var uids = area.timer.getWatcherUids(pos, [EntityType.PLAYER], ignoreList);
  //
  // if (uids.length > 0) {
  //   this.pushMessageByUids(uids, msg.route, msg);
  // }
};

function errHandler(err, fails){
	if(!!err){
		logger.error('Push Message error! %j', err.stack);
	}
}

module.exports = {
    id:"messageService",
    func:MessageService,
    props:[
        {name:"consts", ref:"consts"}
    ]
}