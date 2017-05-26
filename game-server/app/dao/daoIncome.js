/**
 * Created by linyng on 17-5-26.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoIncome = function () {

};

DaoIncome.prototype.addIncome = function (income, cb) {
    var sql = 'insert into Income (playerId,betMoney,incomeMoney,defection,rebateRate,rebateMoney,incomeTime) values(?,?,?,?,?,?,?)';
    var args = [income.playerId, income.betMoney, income.incomeMoney, income.defection, income.rebateRate, income.rebateMoney, income.incomeTime];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, {
                id: res.insertId,
                playerId:income.playerId,
                betMoney:income.betMoney,
                incomeMoney:income.incomeMoney,
                defection:income.defection,
                rebateRate:income.rebateRate,
                rebateMoney:income.rebateMoney,
                incomeTime:income.incomeTime,
            });
        }
    });
};

DaoIncome.prototype.agentAddIncome = function (income, cb) {

    //todo 判断是否存在，存在就更新，不存在就插入

    var sql = 'insert into Income (playerId,betMoney,incomeMoney,defection,rebateRate,rebateMoney,incomeTime) values(?,?,?,?,?,?,?)';
    var args = [income.playerId, income.betMoney, income.incomeMoney, income.defection, income.rebateRate, income.rebateMoney, income.incomeTime];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, {
                id: res.insertId,
                playerId:income.playerId,
                betMoney:income.betMoney,
                incomeMoney:income.incomeMoney,
                defection:income.defection,
                rebateRate:income.rebateRate,
                rebateMoney:income.rebateMoney,
                incomeTime:income.incomeTime,
            });
        }
    });
};

DaoIncome.prototype.getTodayIncome = function (playerId, incomeTime, cb) {
    var sql = 'select * from Income playerId = ?,incomeTime = ?';
    var args = [playerId, incomeTime];
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

module.exports ={
    id:"daoIncome",
    func:DaoIncome,
    props:[
        {name:"utils", ref:"utils"},
        {name:"consts", ref:"consts"}
    ]
}