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
    var roleName = session.get('roleName');
    var roomId = msg.roomId;
    this.chatService.add(session.uid, session.frontendId, roleName, roomId);

    session.set('roomId', roomId);
    session.push('roomId', function(err) {
        if(err) {
            console.error('set roomId for session service failed! error is : %j', err.stack);
        }
    });

    next(null, {code: Code.OK, response:this.chatService.getUsers(roomId)});
};

ChatHandler.prototype.leaveRoom = function (msg, session, next) {
    this.chatService.leave(session.uid, session.get('roomId'));
};

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
ChatHandler.prototype.sendChatMsg = function(msg, session, next) {
    this.chatService.pushByRoomId(session.get('roomId'), msg, next);
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