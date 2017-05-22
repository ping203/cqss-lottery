/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoLottery = function () {

};

DaoLottery.prototype.addLottery = function (lastLottery, cb) {
    var sql = 'insert into Lottery (period,identify,numbers,openTime) values(?,?,?,?)';
    var args = [lastLottery.period, lastLottery.identify, lastLottery.numbers, lastLottery.openTime];

    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            this.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            this.utils.invokeCallback(cb, null, {
                id: res.insertId,
                period:lastLottery.period,
                identify:lastLottery.identify,
                numbers:lastLottery.numbers,
                openTime:lastLottery.openTime
            });
        }
    });
};

DaoLottery.prototype.getLottery = function (period, cb) {
    var sql = 'select * from Lottery where period = ?';
    var args = [period];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                this.utils.invokeCallback(cb, null, res[0]);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

DaoLottery.prototype.getLotterys = function (skip, limit, cb) {
    var sql = 'select * from Lottery limit ?,?';
    var args = [skip,limit];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                this.utils.invokeCallback(cb, null, res);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
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