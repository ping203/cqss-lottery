var Code = require('../../../../../shared/code');
var logger = require('pomelo-logger').getLogger(__filename);
var SCOPE = {PRI:'private', TEAM:'team', ALL:'*'};
var pomelo = require('pomelo');
var bearcat = require("bearcat");

var ChatHandler = function(app) {
    this.app = app;
    this.chatService = null;
    this.consts = null;
    this.utils = null;
};

function setContent(str) {
    str = str.replace(/<\/?[^>]*>/g,'');
    str = str.replace(/[ | ]*\n/g,'\n');
    return str.replace(/\n[\s| | ]*\r/g,'\n');
}

ChatHandler.prototype.getRooms = function(msg, session, next){
    next(null, {code: Code.OK, response:this.chatService.getRoomList()});
   // this.chatService.init();
}

/**
 * enter room
 * @param msg
 * @param session
 * @param next
 */
ChatHandler.prototype.enterRoom = function(msg, session, next){
 //   frontendId = "connector-server-1"
    console.log('**********************************************' + this.chatService);
    var roleName = session.get('roleName');
    var roomId = msg.roomId;
    this.chatService.add(session.uid, session.frontendId, roleName, roomId);
    next(null, {code: Code.OK, response:this.chatService.getUsers(roomId)});
};

ChatHandler.prototype.leaveRoom = function (msg, session, next) {
    this.chatService.leave(session.uid, msg.roomId);
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
ChatHandler.prototype.send = function(msg, session, next) {
    this.chatService.pushByRoomId(msg.roomId, msg, next);
    /*

     var param = {
     route: 'onChat',
     msg: msg.content,
     from: username,
     target: msg.target
     };
     channel = channelService.getChannel(rid, false);

     //the target is all users
     if(msg.target == '*') {
     channel.pushMessage(param);
     }
     //the target is specific user
     else {
     var tuid = msg.target + '*' + rid;
     var tsid = channel.getMember(tuid)['sid'];
     channelService.pushMessageByUids(param, [{
     uid: tuid,
     sid: tsid
     }]);
     }
     next(null, {
     route: msg.route
     });

  */

};

module.exports = function (app) {
    return bearcat.getBean({
        id: "chatHandler",
        func: ChatHandler,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name:"chatService",ref:"chatService"},
            {name:"consts", ref:"consts"},
            {name:"utils", ref:"utils"}
        ]
    });
};