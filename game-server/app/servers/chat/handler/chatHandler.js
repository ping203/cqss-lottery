var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require("bearcat");
var Code = require('../../../../../shared/code');
var Answer = require('../../../../../shared/answer');

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
    next(null, new Answer.DataResponse(Code.OK, this.chatService.getRoomList()));
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

    next(null, new Answer.DataResponse(Code.OK, this.chatService.getUsers(roomId)));
};

ChatHandler.prototype.leaveRoom = function (msg, session, next) {
    this.chatService.leave(session.uid, session.get('roomId'));
    next(null);
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
    if(!this.chatService.canTalk(session.uid)){
        next(null, new Answer.NoDataResponse(Code.CHAT.FA_CHAT_FORBIDTALK));
        return;
    }

    if(!this.consts.ChatMsgType.isSupported(msg.msgType)){
        next(null, new Answer.NoDataResponse(Code.CHAT.FA_UNSUPPORT_CHAT_MSGTYPE));
        return;
    }

    if(!msg.from || !msg.target || !msg.content){
        next(null, new Answer.NoDataResponse(Code.CHAT.FA_CHAT_DATA_ERROR));
        return;
    }

    msg.time = Date.now();

    this.chatService.pushByRoomId(session.get('roomId'), msg, next);
};

ChatHandler.prototype.getPlayerBaseInfo = function(msg, session, next){
    if(!msg.uid){
        next(null, new Answer.NoDataResponse(Code.PARAMERROR));
        return;
    }

    this.app.rpc.area.playerRemote.getPlayerBaseInfo(session, msg.uid, function (err, result) {
        if(!!err){
            next(null, new Answer.NoDataResponse(err));
            return;
        }
        next(null, new Answer.DataResponse(Code.OK, result));
    });
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