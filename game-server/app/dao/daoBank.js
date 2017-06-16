/**
 * Created by linyng on 17-6-16.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const pomelo = require('pomelo');
const bearcat = require('bearcat');

function DaoBank() {
};

//绑定银行卡
DaoBank.prototype.bind = function (playerId, address, username, cardNO, cb) {
    var sql = 'insert into Bank (uid,address,username,cardNO, bindTime) values(?,?,?,?,?)';
    var args = [playerId, address, username, cardNO, Date.now()];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err, false);
        } else {
           // let bank = bearcat.getBean("bankItem",{id:res.insertId, playerId:playerId, address:address, username:username, cardNO:cardNO});
            self.utils.invokeCallback(cb, null, {
                address:address,
                username:username,
                cardNO:cardNO
            });
        }
    });
};

DaoBank.prototype.get = function (playerId, cb) {
    var sql = 'select * from Bank where uid=?';
    var args = [playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err, null);
        } else {
            if (!!res && res.length >= 1) {
                logger.error(res[0]);
                self.utils.invokeCallback(cb, null, {
                    address:res[0].address,
                    username:res[0].username,
                    cardNO:res[0].cardNO
                });
            } else {
                self.utils.invokeCallback(cb, null, null);
            }
        }
    });
};

module.exports = {
    id:"daoBank",
    func:DaoBank,
    props:[
        {name:'utils', ref:'utils'}
    ]
}