/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoBets = function () {

};

DaoBets.prototype.addBet = function (bet, cb) {
    var sql = 'insert into Bets (uid,period,identify,betInfo,state,betCount,winCount,betMoney,winMoney,betTime) values(?,?,?,?,?,?,?,?,?,?)';
    var args = [bet.playerId, bet.period, bet.identify, bet.betData, bet.state, bet.betCount, bet.winCount, bet.betMoney, bet.winMoney, bet.betTime];
    var self = this;
    pomelo.app.get('dbclient').insert(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            var betItem = bearcat.getBean("betItem", {
                id: res.insertId,
                playerId: bet.playerId,
                period: bet.period,
                identify: bet.identify,
                betInfo: bet.betData,
                state: bet.state,
                betCount: bet.betCount,
                winCount: bet.winCount,
                betMoney: bet.betMoney,
                winMoney: bet.winMoney,
                betTime: bet.betTime
            });

            self.utils.invokeCallback(cb, null, betItem);
        }
    });
};

DaoBets.prototype.getBets = function (skip, limit, cb) {
    var sql = 'select * from Bets limit ?,?';
    var args = [skip, limit];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length >= 1) {
                var items = [];
                for (var i = 0; i < res.length; ++i) {
                    var betItem = bearcat.getBean("betItem", {
                        id: res[i].id,
                        period: res[i].period,
                        identify: res[i].identify,
                        numbers: res[i].numbers,
                        openTime: res[i].openTime
                    });
                    items.push(betItem);
                }

                self.utils.invokeCallback(cb, null, items);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};

DaoBets.prototype.getBetStatistics = function (playerId, cb) {
    var sql = 'select sum(betCount) as betCount, sum(winCount) as winCount from Bets where uid= ? and state =?';
    var args = [playerId, this.consts.BetState.BET_OPENNED];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var r = {};
                r.betCount = res[0].betCount ? res[0].betCount : 0;
                r.winCount = res[0].winCount ? res[0].winCount : 0;
                self.utils.invokeCallback(cb, null, r);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};

// 获取玩家一天的投注反水基准数据
DaoBets.prototype.getDayIncome = function (playerId, beginTime, endTime, cb) {
    var sql = 'select sum(betMoney) as dayBetMoney, sum(winMoney) as dayWinMoney,sum(betCount) as dayBetCount, sum(winCount) as dayWinCount from Bets where betTime >= ? and betTime <= ? and uid=?';
    var args = [beginTime, endTime, playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1 && !!res[0].dayBetMoney) {
                self.utils.invokeCallback(cb, null, res[0]);
            } else {
                self.utils.invokeCallback(cb, 'Bets not exist', null);
            }
        }
    });
};

DaoBets.prototype.getDayIncomes = function (beginTime, endTime, cb) {
    var sql = 'select playerId, sum(betMoney) as dayBetMoney, sum(winMoney) as dayWinMoney from Bets where betTime >= ? and betTime <= ?';
    var args = [beginTime, endTime];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length > 0) {
                self.utils.invokeCallback(cb, null, res);
            } else {
                self.utils.invokeCallback(cb, 'Bets not exist', null);
            }
        }
    });
};

module.exports = {
    id: "daoBets",
    func: DaoBets,
    props: [
        {name: "utils", ref: "utils"},
        {name: "consts", ref: "consts"}
    ]
}