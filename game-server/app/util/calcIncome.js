/**
 * Created by linyng on 17-5-26.
 */

var async = require('async');
var logger = require('pomelo-logger').getLogger(__filename);
var CalcIncome = function () {
    this.beginTime = 0;
    this.endTime = 0;
    this.incomeTime = 0;
};

//玩家反水
CalcIncome.prototype.playerDefection = function (playerId, callback) {
    var self = this;
    async.waterfall([
        function (cb) {
            self.daoBets.getPlayerBetBaseInfo(playerId.id, self.beginTime, self.endTime, function (err, income) {
                cb(null, income);
            });
        }, function (income, cb) {

            var playerDayIncomeInfo = {
                playerId: playerId.id,
                betMoney: 0,
                incomeMoney: 0,
                defection: 0,
                defectionRate: 0,
                winRate: 0.0,
                incomeTime: self.beginTime
            };

            if (!!income) {
                if (income.dayBetCount > 0) {
                    playerDayIncomeInfo.winRate = income.dayWinCount/income.dayBetCount/100;
                }

                var defection = 0; //反水 todo:>0
                var defectionRate = self.incomeCfg.getDefectionRate(playerId.level);
                //盈亏金额
                var incomeMoney = income.dayWinMoney - income.dayBetMoney;
                if (incomeMoney < 0 && income.dayBetMoney >= 50) {
                    defection = Math.abs(incomeMoney) * defectionRate;
                    playerDayIncomeInfo.defectionRate = defectionRate;
                }


                playerDayIncomeInfo.betMoney = income.dayBetMoney;
                playerDayIncomeInfo.incomeMoney = incomeMoney;
                playerDayIncomeInfo.defection = defection;
            }

            self.daoIncome.addPlayerIncome(playerDayIncomeInfo, function (err, res) {
                if (err) {
                    logger.error('run addIncome failed!' + err.stack);
                    return;
                }
                callback(null, res);
            })
        }
    ]);

};

CalcIncome.prototype.getPlayerIncome = function (playerId, callback) {

    this.daoIncome.getTodayIncome(playerId, this.incomeTime, function (err, res) {
        if (err) {
            logger.error('run addIncome failed!' + err.stack);
            return;
        }
        callback(null, res);
    })
};

CalcIncome.prototype.agentRebate = function (agent, callback) {
    // id, userId, level

    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getUserById(agent.playerId, cb);
        }, function (user, cb) {
            if (!user) {
                return;
            }

            var playerIds = JSON.parse(user.friends);
            if (!playerIds) {
                return;
            }

            async.map(playerIds, self.getPlayerIncome.bind(self), function (err, incomes) {
                async.reduce(incomes, {betMoney: 0, incomeMoney: 0,}, function (reduce, item, callback) {
                    reduce.betMoney += item.betMoney;
                    reduce.incomeMoney += item.incomeMoney;
                    reduce.defection += item.defection;
                    callback(null, reduce);

                }, function (err, income) {

                    var rebateMoney = 0; //分成
                    //盈亏金额
                    var incomeMoney = (-income.incomeMoney) - income.defection;
                    if (incomeMoney < 0 && income.betMoney >= 50) {
                        defection = Math.abs(incomeMoney) * this.incomeCfg.getRebateRate(agent.level);
                    }

                    self.daoIncome.agentAddIncome({
                        playerId: agent.playerId,
                        betMoney: income.betMoney,
                        incomeMoney: income.incomeMoney,
                        defection: income.defection,
                        rebateRate: this.incomeCfg.getRebateRate(agent.level),
                        rebateMoney: rebateMoney,
                        incomeTime: begin_time.getTime()
                    }, function (err, res) {
                        if (err) {
                            logger.error('run addIncome failed!' + err.stack);
                            return;
                        }
                        callback(null, res);
                    })


                    winston.info("代理商分成总额:" + income.incomeMoney);
                    callback(null, {playerId: incomes[0].playerId, income: income});
                });
            });

        }
    ]);
};

//玩家反水入账
CalcIncome.prototype.playerIncomeInsertAccount = function (income, callback) {
    if (income.defection > 0) {
        this.daoUser.updateAccountAmount(income.playerId, income.defection, callback);
    }
};

//代理商分成入账
CalcIncome.prototype.agentsRebateInsertAccount = function (income, callback) {

};

CalcIncome.prototype.playersCalc = function () {
    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getPlayersIncomeId(cb);
        },
        function (incomeIds, cb) {
            async.map(incomeIds, self.playerDefection.bind(self), function (err, playerIncomes) {
                if (err) {
                    logger.error('run playerDefection failed!' + err);
                }
                cb(null, playerIncomes)
            });
        }, function (playerIncomes, cb) {
            async.map(playerIncomes, self.playerIncomeInsertAccount.bind(self), function (err, result) {
                if (err) {
                    logger.error('run getPlayers failed!' + err.stack);
                }
                cb(null);
            });
        }

    ], function (err) {
        if (err) {
            logger.error('CalcIncome failed!' + err);
            return;
        }

       // self.agentsCalc();

    });
};

//代理商分成
CalcIncome.prototype.agentsCalc = function () {

    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getAgents(cb);
        },
        function (agents, cb) {
            async.map(agents, self.agentRebate.bind(self), function (err, agentsIncome) {
                if (err) {
                    logger.error('run agentRebate failed!' + err);
                }
                cb(null, agentsIncome)
            })
        },
        function (agentsIncome, cb) {
            async.map(agentsIncome, self.agentsRebateInsertAccount.bind(this), function (err, results) {

            });
        }
    ], function (err) {
        if (err) {
            logger.error('CalcIncome failed!' + err);
            return;
        }
    });

};

CalcIncome.prototype.calc = function () {

    var now = new Date();
    var begin = new Date(now);
    begin.setHours(0, 0, 0, 0);

    this.beginTime = begin.getTime();

    var end = new Date(now);
    end.setHours(23, 59, 59, 999);
    this.endTime = end.getTime();

    this.incomeTime = begin.getTime();

    this.playersCalc();
};

module.exports = {
    id: "calcIncome",
    func: CalcIncome,
    props: [
        {name: "daoUser", ref: "daoUser"},
        {name: "daoBets", ref: "daoBets"},
        {name: "incomeCfg", ref: "incomeCfg"},
        {name: "daoIncome", ref: "daoIncome"}
    ]
}