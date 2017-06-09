/**
 * Created by linyng on 17-5-21.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoRecord = function () {

};

DaoRecord.prototype.add = function (playerId, num, type, cb) {
    var sql = 'insert into Record (uid,num,type,create_time) values(?,?,?,?)';
    var args = [playerId,num,type,Date.now()];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            logger.error('写入资金流动记录失败,',err,'|uid:',playerId,'|num:',num,'|type:',type);
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, null);
        }
    });
};

DaoRecord.prototype.get = function (playerId, skip, limit, cb) {
    var sql = 'select * from Record where uid= ? ORDER BY create_time DESC limit ?,?';
    var self = this;
    pomelo.app.get('dbclient').insert(sql, [playerId, skip, limit], function (err, res) {
        if (err !== null) {
            logger.error('读取流水记录失败,',err);
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, res);
        }
    });

};

module.exports = {
    id:"daoRecord",
    func:DaoRecord,
    props:[
        {name:"utils", ref:"utils"}
    ]
}