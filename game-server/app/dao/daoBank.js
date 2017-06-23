/**
 * Created by linyng on 17-6-16.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const pomelo = require('pomelo');
const bearcat = require('bearcat');

function DaoBank() {
};

//绑定银行卡
DaoBank.prototype.bind = function (playerId, address, username, cardNO, alipay,wechat, cb) {
    var sql = 'insert into Bank (uid,address,username,cardNO, weixin, zhifubao, bindTime) values(?,?,?,?,?,?,?)';
    var args = [playerId, address, username, cardNO, alipay,wechat,Date.now()];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            logger.error(err);
            self.utils.invokeCallback(cb, err, false);
        } else {
            self.utils.invokeCallback(cb, null, {
                address:address,
                username:username,
                cardNO:cardNO,
                alipay:alipay,
                wechat:wechat
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
                    cardNO:res[0].cardNO,
                    alipay:res[0].zhifubao,
                    wechat:res[0].weixin
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