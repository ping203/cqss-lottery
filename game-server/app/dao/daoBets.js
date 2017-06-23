/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoBets = function () {

};

DaoBets.prototype.addBet = function (bet, cb) {
    var sql = 'insert into Bets (uid,period,identify,betInfo,state,betCount,' +
        'winCount,betMoney,winMoney,betTime, betTypeInfo) values(?,?,?,?,?,?,?,?,?,?,?)';
    var args = [bet.playerId, bet.period, bet.identify, bet.betInfo, bet.state,
        bet.betCount, bet.winCount, bet.betMoney, bet.winMoney, bet.betTime, JSON.stringify(bet.betTypeInfo)];
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
                betInfo: bet.betInfo,
                state: bet.state,
                betCount: bet.betCount,
                winCount: bet.winCount,
                betMoney: bet.betMoney,
                winMoney: bet.winMoney,
                betTime: bet.betTime,
                betTypeInfo:bet.betTypeInfo
            });

            self.utils.invokeCallback(cb, null, betItem);
        }
    });
};
//select * from Bets b left join User u on b.uid = u.id where uid=3 limit 0,10
DaoBets.prototype.getBets = function (playerId, skip, limit, cb) {
    var sql = 'select * from Bets where uid=? order by betTime DESC limit ?,?';
    var args = [playerId, skip, limit];
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
                        playerId: res[i].uid,
                        period: res[i].period,
                        identify: res[i].identify,
                        betInfo: res[i].betInfo,
                        state: res[i].state,
                        betCount: res[i].betCount,
                        winCount: res[i].winCount,
                        betMoney: res[i].betMoney,
                        winMoney: res[i].winMoney,
                        betTime: res[i].betTime,
                        betTypeInfo:JSON.parse(res[i].betTypeInfo)
                    });
                    items.push(betItem.strip());
                }

                self.utils.invokeCallback(cb, null, items);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};
//select * from Bets b left join User u on b.uid = u.id where uid=3 ORDER BY betTime DESC limit 0,10
//select * from Bets b left join User u on b.uid = u.id ORDER BY betTime DESC limit 0,10
DaoBets.prototype.getLatestBets = function (skip, limit, cb) {
    var sql = 'select b.id,b.uid,b.period,b.identify,b.betInfo,b.state,b.betCount,b.winCount,b.betMoney,b.winMoney,b.betTime,b.betTypeInfo,u.roleName from Bets b left join User u on b.uid = u.id ORDER BY betTime DESC limit ?,?';
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
                        playerId: res[i].uid,
                        period: res[i].period,
                        identify: res[i].identify,
                        betInfo: res[i].betInfo,
                        state: res[i].state,
                        betCount: res[i].betCount,
                        winCount: res[i].winCount,
                        betMoney: res[i].betMoney,
                        winMoney: res[i].winMoney,
                        betTime: res[i].betTime,
                        betTypeInfo:JSON.parse(res[i].betTypeInfo)
                    });
                    betItem.setRoleName(res[i].roleName);
                    items.push(betItem);
                }

                self.utils.invokeCallback(cb, null, items);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};

DaoBets.prototype.restoreBets = function (playerId, cb) {
    var sql = 'select b.id,b.uid,b.period,b.identify,b.betInfo,b.state,b.betCount,b.winCount,b.betMoney,b.winMoney,b.betTime,b.betTypeInfo,u.roleName from Bets b left join User u on b.uid = u.id where b.state = ? and b.uid = ? ORDER BY betTime DESC';
    var args = [this.consts.BetState.BET_WAIT, playerId];
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
                        playerId: res[i].uid,
                        period: res[i].period,
                        identify: res[i].identify,
                        betInfo: res[i].betInfo,
                        state: res[i].state,
                        betCount: res[i].betCount,
                        winCount: res[i].winCount,
                        betMoney: res[i].betMoney,
                        winMoney: res[i].winMoney,
                        betTime: res[i].betTime,
                        betTypeInfo:JSON.parse(res[i].betTypeInfo)
                    });
                    betItem.setRoleName(res[i].roleName);
                    items.push(betItem);
                }

                self.utils.invokeCallback(cb, null, items);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};

DaoBets.prototype.getPlayerBetsByTime = function (playerId, beginTime, endTime, cb) {
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
                        playerId: res[i].uid,
                        period: res[i].period,
                        identify: res[i].identify,
                        betInfo: res[i].betData,
                        state: res[i].state,
                        betCount: res[i].betCount,
                        winCount: res[i].winCount,
                        betMoney: res[i].betMoney,
                        winMoney: res[i].winMoney,
                        betTime: res[i].betTime,
                        betTypeInfo:JSON.parse(res[i].betTypeInfo)
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
    var sql = 'select sum(betMoney) as betMoney, sum(betCount) as betCount, sum(winCount) as winCount from Bets where uid= ? and state in(?,?)';
    var args = [playerId, this.consts.BetState.BET_WIN,this.consts.BetState.BET_LOSE];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var r = {};
                r.betCount = res[0].betCount ? res[0].betCount : 0;
                r.winCount = res[0].winCount ? res[0].winCount : 0;
                r.betMoney = res[0].betMoney ? res[0].betMoney : 0;

                self.utils.invokeCallback(cb, null, r);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
};

DaoBets.prototype.getPlayerTodayBets = function (playerId, cb) {

    var now = new Date();
    var begin = new Date(now);
    begin.setHours(0, 0, 0, 0);
    var beginTime = begin.getTime();

    var end = new Date(now);
    end.setHours(23, 59, 59, 999);
    var endTime = end.getTime();

    var sql = 'select sum(betMoney) as betMoney from Bets where uid= ? and betTime >= ? and betTime <= ? and state in(?,?)';
    var args = [playerId, beginTime, endTime, this.consts.BetState.BET_WIN,this.consts.BetState.BET_LOSE];

    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                self.utils.invokeCallback(cb, null, res[0]);
            } else {
                self.utils.invokeCallback(cb, ' Bets not exist ', null);
            }
        }
    });
}

// 获取玩家一天的投注反水基准数据
DaoBets.prototype.getPlayerBetBaseInfo = function (playerId, beginTime, endTime, cb) {
    var sql = 'select sum(betMoney) as dayBetMoney, sum(winMoney) as dayWinMoney,sum(betCount) as dayBetCount, sum(winCount) as dayWinCount from Bets where betTime >= ? and betTime <= ? and uid=? and state in(?,?)';
    var args = [beginTime, endTime, playerId,this.consts.BetState.BET_WIN,this.consts.BetState.BET_LOSE];
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


module.exports = {
    id: "daoBets",
    func: DaoBets,
    props: [
        {name: "utils", ref: "utils"},
        {name: "consts", ref: "consts"}
    ]
}