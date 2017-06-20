/**
 * Created by linyng on 17-4-20.
 */

var bearcat = require("bearcat");
var Code = require('../../../../../shared/code');
var Answer = require('../../../../../shared/answer');
const logger = require('pomelo-logger').getLogger(__filename);
var ChatRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.consts = null;
    this.utils = null;
};

ChatRemote.prototype.join = function(playerId, sid, roleName, roomId, cb) {
    var code = this.chatService.add(playerId, sid, roleName, roomId);
    cb(code);
};

ChatRemote.prototype.leave = function(playerId, roomId, cb) {
    if(!!roomId){
        this.chatService.kick(playerId, roomId);
    }
    cb();
};

/**
 * 聊天消息转发
 */
ChatRemote.prototype.send = function(msg, playerId, roomId, cb) {
    if(!this.chatService.canTalk(playerId)){
        this.utils.invokeCallback(cb, Code.CHAT.FA_CHAT_FORBIDTALK);
        return;
    }

    if(!this.consts.ChatMsgType.isSupported(msg.msgType)){
        this.utils.invokeCallback(cb, Code.CHAT.FA_UNSUPPORT_CHAT_MSGTYPE);
        return;
    }

    if(!msg.from || !msg.target || !msg.content){
        this.utils.invokeCallback(cb, Code.CHAT.FA_CHAT_DATA_ERROR);
        return;
    }
    msg.time = Date.now();

    this.chatService.pushByRoomId(roomId, msg, cb);
};

ChatRemote.prototype.get = function(name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if( !! channel) {
        users = channel.getMembers();
    }
    for(var i = 0; i < users.length; i++) {
        users[i] = users[i].split('*')[0];
    }
    return users;
};

ChatRemote.prototype.userForbidTalk = function (uid, operate, cb) {
    if(!!uid){
        this.chatService.forbidTalk(uid, operate);
    }
    cb(null, new Answer.NoDataResponse(Code.OK));
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "chatRemote",
        func: ChatRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [
            {name:"consts", ref:"consts"},
            {name:"utils", ref:"utils"},
            {name:"chatService",ref:"chatService"}
        ]
    });
};
