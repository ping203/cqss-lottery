/**
 * Created by linyng on 17-4-20.
 */

var bearcat = require("bearcat");


var ChatRemote = function(app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.consts = null;
    this.utils = null;
};

/**
 * Add user into chat channel.
 *
 * @param {String} userId  user id
 * @param {String} roleName  player's role name
 * @param {String} roomId channel name
 *
 */
ChatRemote.prototype.add = function(userId, roleName, roomId, cb) {
    var code = this.chatService.add(userId, roleName, roomId);
    cb(null, code);

    //var channel = this.channelService.getChannel(name, flag);
    // var username = uid.split('*')[0];
    // var param = {
    //     route: 'onAdd',
    //     user: username
    // };
    // channel.pushMessage(param);
    //
    // if( !! channel) {
    //     channel.add(uid, sid);
    // }
    //
    // cb(this.get(name, flag));
};

/**
 * Get user from chat channel.
 *
 * @param {Object} opts parameters for request
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
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

/**
 * Kick user out chat channel.
 *
 * @param {String} uid unique id for user
 *
 */
ChatRemote.prototype.kick = function(userId, roomId, rcb) {
    this.chatService.kick(userId, roomId);
    cb();
    //
    // var channel = this.channelService.getChannel(name, false);
    // // leave channel
    // if( !! channel) {
    //     channel.leave(uid, sid);
    // }
    // var username = uid.split('*')[0];
    // var param = {
    //     route: 'onLeave',
    //     user: username
    // };
    // channel.pushMessage(param);
    // cb();
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
            {name:"utils", ref:"utils"}
        ]
    });
};
