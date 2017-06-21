/**
 * Created by linyng on 17-6-21.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

function DaoChat() {

};

DaoChat.prototype.add = function (playerId, msg, cb) {
    pomelo.app.get('redis').cmd('sadd', playerId, msg, cb);
};

DaoChat.prototype.gets = function (playerId, cb) {
    pomelo.app.get('redis').cmd('smembers', playerId, cb);
};

DaoChat.prototype.del = function () {
    pomelo.app.get('redis').del(playerId, cb);
};

module.exports ={
    id:'daoChat',
    func:DaoChat,
    props:[
        {name:'utils', ref:'utils'}
    ]
}