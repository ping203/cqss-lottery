/**
 * Created by linyng on 2017/5/9.
 */

const Code = require('../../../shared/code');
const logger = require('pomelo-logger').getLogger('bearcat-lottery', 'AreaService');
const bearcat = require('bearcat');
const pomelo = require('pomelo');


var ChatService = function () {
    this.app = pomelo.app;
    this.roomMap = new Map();
    this.uidMap = new Map();
};

/**
 * 初始化聊天服务
 */
ChatService.prototype.init = function () {
    var roomData = this.dataApiUtil.room();
    var self = this;
    roomData.ids.forEach(function (roomId) {
        var roomItem = {};
        var data = roomData.data[roomId];
        console.log(data);
        roomItem.id = data.id;
        roomItem.name = data.name;
        roomItem.accessLevel = data.accessLevel;
        roomItem.maxLoad = data.maxLoad;
        roomItem.userMap = new Map();
        self.roomMap.set(roomId, roomItem);
    });
};

/**
 * alloc room id base user level
 */
ChatService.prototype.allocRoom = function (cb) {
    for(let [id, value] of this.roomMap){
        if(value.userMap.size < value.maxLoad){
            this.utils.invokeCallback(cb, null, id);
            return;
        }
    }
    this.utils.invokeCallback(cb, 'No room available!', null);
};

/**
 * check room id is valid
 * @param roomId
 */
ChatService.prototype.checkRoomIdValid = function (roomId) {
    if(this.roomMap.has(roomId)){
        return true;
    }
    return false;
};

/**
 * Get room list
 * @returns {array|*|Promise.<*>}
 */
ChatService.prototype.getRoomList = function () {
    return this.dataApiUtil.room().data;
};

/**
 * Add player into the channel
 *
 * @param {String} userId         user id
 * @param {String} roleName  player's role name
 * @param {String} roomId channel name
 * @return {Number} see code.js
 */
ChatService.prototype.add = function (userId, sid, roleName, roomId) {
    if (checkDuplicate(this, userId, roomId)) {
        return Code.OK;
    }

    var enterRoomId = this.uidMap.get(userId);
    if(enterRoomId){
        this.leave(userId, enterRoomId);
    }

    var channel = this.app.get('channelService').getChannel(roomId, true);
    if (!channel) {
        return Code.CHAT.FA_CHANNEL_CREATE;
    }

    channel.pushMessage(this.consts.Event.chat.enterRoom, {uid:userId,roleName:roleName});
    logger.error('ChatService.prototype.add');
    channel.add(userId, sid);
    addRecord(this, userId, roleName, sid, roomId);
};

/**
 * User leaves the channel
 *
 * @param  {String} userId         user id
 * @param  {String} roomId room id
 */
ChatService.prototype.leave = function (userId, roomId) {
    var record = this.roomMap.get(roomId).userMap.get(userId);
    var channel = this.app.get('channelService').getChannel(roomId, true);

    if (channel && record) {
        channel.leave(userId, record.sid);
    }
    removeRecord(this, userId, roomId);

    channel.pushMessage(this.consts.Event.chat.leaveRoom, {uid:userId});
    logger.error('ChatService.prototype.leave');
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

/**
 * Kick user from chat service.
 * This operation would remove the user from all channels and
 * clear all the records of the user.
 *
 * @param  {String} uid         user id
 * @param  {String} roomId room id
 */
ChatService.prototype.kick = function (userId, roomId) {
    var record = this.roomMap.get(roomId).userMap.get(userId);
    var channel = this.app.get('channelService').getChannel(roomId, true);

    if (channel && record) {
        channel.leave(userId, record.sid);
    }
    removeRecord(this, userId, roomId);

    channel.pushMessage(this.consts.Event.chat.leaveRoom, {uid:userId});
};

/**
 * Push message by the specified channel
 *
 * @param  {String}   channelName channel name
 * @param  {Object}   msg         message json object
 * @param  {Function} cb          callback function
 */
ChatService.prototype.pushByRoomId = function (roomId, msg, cb) {
    var channel = this.app.get('channelService').getChannel(roomId);
    if (!channel) {
        cb(new Error('channel ' + roomId + ' dose not exist'));
        return;
    }

    channel.pushMessage(this.consts.Event.chat.chatMessage, msg, cb);
};

/**
 * Push message to the specified player
 *
 * @param  {String}   userId player's role name
 * @param  {Object}   msg        message json object
 * @param  {Function} cb         callback
 */
ChatService.prototype.pushByUID = function (userId, msg, cb) {
    var record = this.roomMap.get(msg.roomId).userMap.get(userId);
    if (!record) {
        cb(null, this.code.CHAT.FA_USER_NOT_ONLINE);
        return;
    }

    this.app.get('channelService').pushMessageByUids(this.consts.Event.chat.chatMessage, msg, [{
        uid: record.uid,
        sid: record.sid
    }], cb);
};

/**
 * Cehck whether the user has already in the channel
 * @param service
 * @param userId
 * @param roomId
 * @returns {boolean}
 */
var checkDuplicate = function (service, userId, roomId) {
    return !!service.roomMap.get(roomId) && !!service.roomMap.get(roomId).userMap.get(userId);
};

/**
 * Add records for the specified user
 */
var addRecord = function (service, userId, roleName, sid, roomId) {
    var record = {uid: userId, name: roleName, sid: sid};
    service.roomMap.get(roomId).userMap.set(userId, record);
    service.uidMap.set(userId, roomId);
};

/**
 * Remove records for the specified user and channel pair
 */
var removeRecord = function (service, userId, roomId) {
    service.roomMap.get(roomId).userMap.delete(userId);
    service.uidMap.delete(userId);
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
    }]
}
