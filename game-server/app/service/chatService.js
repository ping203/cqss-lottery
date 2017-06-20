/**
 * Created by linyng on 2017/5/9.
 */

const Code = require('../../../shared/code');
const logger = require('pomelo-logger').getLogger(__filename);
const bearcat = require('bearcat');
const pomelo = require('pomelo');


var ChatService = function () {
    this.app = pomelo.app;
    this.roomMap = new Map();
    this.uidMap = new Map();

    // this.uidMap = {};
    // this.nameMap = {};
    // this.channelMap = {};
};

/**
 * 初始化聊天服务
 */
ChatService.prototype.init = function () {
    this.loadForbidTalkUser();
};

ChatService.prototype.loadForbidTalkUser = function () {
    var self = this;
    this.daoUser.getForbidUserID(function (err, uids) {
        if(err){
            self.forbidTalkSet = new Set();
        }
        else {
            self.forbidTalkSet = new Set(uids);
        }
    });
};

ChatService.prototype.allocRoom = function (cb) {
    for(let [id, value] of this.roomMap){
        if(value.userMap.size < value.maxLoad){
            this.utils.invokeCallback(cb, null, id);
            return;
        }
    }
    this.utils.invokeCallback(cb, 'No room available!', null);
};

ChatService.prototype.checkRoomIdValid = function (roomId) {
    if(this.roomMap.has(roomId)){
        return true;
    }
    return false;
};

ChatService.prototype.getRoomList = function () {
    return this.dataApiUtil.room().data;
};

ChatService.prototype.add = function (playerId, sid, roleName, roomId) {
    if (checkDuplicate(this, playerId, roomId)) {
        return Code.OK;
    }

    var enterRoomId = this.uidMap.get(playerId);
    if(!!enterRoomId){
        this.leave(playerId, enterRoomId);
    }

    var channel = this.app.get('channelService').getChannel(roomId, true);
    if (!channel) {
        return Code.CHAT.FA_CHANNEL_CREATE;
    }
    channel.pushMessage(this.consts.Event.chat.enterRoom, {uid:playerId,roleName:roleName});
    channel.add(playerId, sid);
    addRecord(this, playerId, roleName, sid, roomId);

    return Code.OK;
};

ChatService.prototype.leave = function (playerId, roomId) {
    logger.error('!!!!!!!!!!!ChatService leave', playerId, roomId);

    var record = this.roomMap.get(roomId).get(playerId);
    var channel = this.app.get('channelService').getChannel(roomId, true);

    logger.error('!!!!!!!!!!!ChatService record', record);

    if (channel && record) {
        channel.leave(playerId, record.sid);
        logger.error('!!!!!!!!!!!ChatService record 11111', record);
    }

    removeRecord(this, playerId, roomId);

    channel.pushMessage(this.consts.Event.chat.leaveRoom, {uid:playerId});
    logger.error('ChatService.prototype.leave');
};

ChatService.prototype.canTalk = function (uid) {
  return !this.forbidTalkSet.has(uid);
};

ChatService.prototype.forbidTalk = function (uid, operate) {
    if(operate){
        this.forbidTalkSet.add(uid);
    }
    else {
        this.forbidTalkSet.delete(uid);
    }
};


function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k,v] of strMap) {
        obj[k] = v;
    }
    return obj;
}

function mapToJson(map) {
    return JSON.stringify([...map]);
}

ChatService.prototype.getUsers = function (roomId) {
    let userMap =  this.roomMap.get(roomId).userMap;
    return strMapToObj(userMap);
};

ChatService.prototype.kick = function (playerId, roomId) {
    var record = this.roomMap.get(roomId).get(playerId);
    var channel = this.app.get('channelService').getChannel(roomId, true);

    if (channel && record) {
        channel.leave(playerId, record.sid);
    }
    removeRecord(this, playerId, roomId);

    channel.pushMessage(this.consts.Event.chat.leaveRoom, {uid:playerId});
};

ChatService.prototype.pushByRoomId = function (roomId, msg, cb) {
    var channel = this.app.get('channelService').getChannel(roomId);
    if (!channel) {
        this.utils.invokeCallback(cb, Code.CHAT.FA_CHANNEL_NOT_EXIST);
        return;
    }
    channel.pushMessage(this.consts.Event.chat.chatMessage, msg, cb);
    this.utils.invokeCallback(cb, Code.OK);
};

ChatService.prototype.pushByUID = function (uid, msg, cb) {
    var record = this.roomMap.get(msg.roomId).get(uid);
    if (!record) {
        cb(null, this.code.CHAT.FA_USER_NOT_ONLINE);
        return;
    }

    this.app.get('channelService').pushMessageByUids(this.consts.Event.chat.chatMessage, msg, [{
        uid: record.uid,
        sid: record.sid
    }], cb);
};

var checkDuplicate = function (service, playerId, roomId) {
    return !!service.roomMap.get(roomId) && !!service.roomMap.get(roomId).get(playerId);
};

var addRecord = function (service, playerId, roleName, sid, roomId) {
    let record = {uid: playerId, name: roleName, sid: sid};
    let userMap = service.roomMap.get(roomId);
    if(!userMap){
        userMap = new Map;
        service.roomMap.set(roomId, userMap);
    }
    userMap.set(playerId, record);
    service.uidMap.set(playerId, roomId);
};

var removeRecord = function (service, playerId, roomId) {
    let userMap = service.roomMap.get(roomId);
    if(!!userMap){
        userMap.delete(playerId);
        service.uidMap.delete(playerId);
    }
};

module.exports = {
    id: "chatService",
    func: ChatService,
    props: [{
        name: "utils",
        ref: "utils"
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
}
