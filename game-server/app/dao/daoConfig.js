/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoConfig = function () {

};

DaoConfig.prototype.defaultConfig = function (bet, cb) {
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

DaoConfig.prototype.getBets = function (skip, limit, cb) {
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

module.exports = {
    id: "daoConfig",
    func: DaoConfig,
    props: [
        {name: "utils", ref: "utils"},
        {name: "consts", ref: "consts"}
    ]
}