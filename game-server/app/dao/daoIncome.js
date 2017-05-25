/**
 * Created by linyng on 17-5-26.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');
var async = require('async');

var DaoIncome = function () {

};
//insert into PlayerIncome (uid,betMoney,incomeMoney,defection,defectionRate,winRate,incomeTime) values(1,10,0,1,0.01,0.12,1498455454)
// 加入玩家今日反水信息
DaoIncome.prototype.addPlayerIncome = function (income, cb) {
    var sql = 'insert into PlayerIncome (uid,betMoney,incomeMoney,defection,defectionRate,winRate,incomeTime) values(?,?,?,?,?,?,?)';
    var args = [income.playerId, income.betMoney, income.incomeMoney, income.defection, income.defectionRate, income.winRate, income.incomeTime];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            logger.error(err);
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            self.utils.invokeCallback(cb, null, {
                id: res.insertId,
                playerId: income.playerId,
                betMoney: income.betMoney,
                incomeMoney: income.incomeMoney,
                defection: income.defection,
                defectionRate: income.defectionRate,
                winRate: income.winRate,
                incomeTime: income.incomeTime,
            });
        }
    });
};

DaoIncome.prototype.getPlayerIncomeByTime = function (playerId, incomeTime, cb) {
    var sql = 'select * from PlayerIncome uid = ?,incomeTime = ?';
    var args = [playerId, incomeTime];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
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

DaoIncome.prototype.getPlayerIncomes = function (playerId, skip, limit, cb) {
    var sql = 'select * from PlayerIncome where uid = ? ORDER BY incomeTime DESC limit ?,?';
    var args = [playerId, skip, limit];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length > 1) {
                self.utils.invokeCallback(cb, null, res);
            } else {
                self.utils.invokeCallback(cb, 'income not exist ', null);
            }
        }
    });
};

DaoIncome.prototype.getMyFriendIncomes = function (playerId, skip, limit, callaback) {

    var self = this;
    async.waterfall([function (cb) {
        self.daoUser.getMyFriends(playerId, cb);
    },function (friends, cb) {
        var newf = friends.replace(/\[/g,"").replace(/\]/g,"");
        var sql = 'select * from PlayerIncome where uid in(?) ORDER BY incomeTime DESC limit ?,?';
        var args = [newf, skip, limit];
        pomelo.app.get('dbclient').query(sql, args, function (err, res) {
            if (err !== null) {
                self.utils.invokeCallback(callaback, err.message, null);
            } else {
                if (!!res && res.length > 1) {
                    self.utils.invokeCallback(callaback, null, res);
                } else {
                    self.utils.invokeCallback(callaback, 'income not exist ', null);
                }
            }
        });
    }]);
};

module.exports = {
    id: "daoIncome",
    func: DaoIncome,
    props: [
        {name: "utils", ref: "utils"},
        {name: "consts", ref: "consts"},
        {name: "daoUser", ref: "daoUser"}
    ]
}