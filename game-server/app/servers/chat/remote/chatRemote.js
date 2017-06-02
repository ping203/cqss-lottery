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

ChatRemote.prototype.add = function(userId, roleName, roomId, cb) {
    var code = this.chatService.add(userId, roleName, roomId);
    cb(null, code);
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

ChatRemote.prototype.kick = function(userId, roomId, cb) {
    if(!!roomId){
        this.chatService.kick(userId, roomId);
    }
    cb();
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
