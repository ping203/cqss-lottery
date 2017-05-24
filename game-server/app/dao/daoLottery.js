/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoLottery = function () {

};

DaoLottery.prototype.addLottery = function (identify, period, numbers,openTime, cb) {
    var sql = 'insert into Lottery (period,identify,numbers,openTime) values(?,?,?,?)';
    var args = [period, identify, numbers, openTime];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, {
                id: res.insertId,
                period:period,
                identify:identify,
                numbers:numbers,
                openTime:openTime
            });
        }
    });
};

DaoLottery.prototype.getLottery = function (period, cb) {
    var sql = 'select * from Lottery where period = ?';
    var args = [period];
    var self = this;
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                self.utils.invokeCallback(cb, null, res[0]);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

DaoLottery.prototype.getLotterys = function (skip, limit, cb) {
    var sql = 'select * from Lottery limit ?,?';
    var args = [skip,limit];
    var self = this;
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                self.utils.invokeCallback(cb, null, res);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

module.exports ={
    id:"daoLottery",
    func:DaoLottery,
    props:[
        {name:"utils", ref:"utils"}
    ]
}