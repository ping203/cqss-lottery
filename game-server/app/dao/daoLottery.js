/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoLottery = function () {

};

DaoLottery.prototype.addLottery = function (identify, period, numbers, openTime, parseResult, cb) {
    var sql = 'insert into Lottery (period,identify,numbers,openTime, parseResult) values(?,?,?,?,?)';
    var args = [period, identify, numbers, openTime, parseResult];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            var item = bearcat.getBean("lotteryItem", {
                id: res.insertId,
                period:period,
                identify:identify,
                numbers: numbers,
                openTime:openTime,
                parseResult:parseResult
            });
            self.utils.invokeCallback(cb, null, item);
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
    var sql = 'select * from Lottery ORDER BY openTime DESC LIMIT ?,?';
    var args = [skip,limit];
    var self = this;
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length >= 1) {

                var items = [];
                for (var i = 0; i < res.length; ++i) {
                    var item = bearcat.getBean("lotteryItem", {
                        id: res[i].id,
                        period:res[i].period,
                        identify:res[i].identify,
                        numbers: res[i].numbers,
                        openTime:res[i].openTime,
                        parseResult: JSON.parse(res[i].parseResult)
                    });
                    items.push(item);
                }
                self.utils.invokeCallback(cb, null, items);
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