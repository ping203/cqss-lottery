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
            self.daoBets.getPlayerBetBaseInfo(playerId.id, self.beginTime, self.endTime, cb);
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
                    playerDayIncomeInfo.winRate = Number(((income.dayWinCount/income.dayBetCount)*100).toFixed(2));
                }

                var defection = 0; //反水
                var defectionRate = self.incomeCfg.getDefectionRate(playerId.level);
                //盈亏金额
                var incomeMoney = income.dayWinMoney - income.dayBetMoney;
                if (incomeMoney < 0 && income.dayBetMoney >= 50) {
                    defection = Math.abs(incomeMoney) * defectionRate/100;
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
                self.utils.invokeCallback(callback, null, res);
            })
        }
    ], function (err) {
        if (err) {
            logger.error('玩家'+playerId.id+'反水存在异常!' + err);
        }
    });

};

// 获取代理下的玩家今日收益
CalcIncome.prototype.getPlayerTodayIncome = function (playerId, callback) {
    var self = this;
    this.daoIncome.getPlayerIncomeByTime(playerId, this.incomeTime, function (err, res) {
        if (err) {
            self.utils.invokeCallback(callback, null, {betMoney: 0, incomeMoney: 0,defection:0});
            return;
        }
        self.utils.invokeCallback(callback, null, res);
    })
};

CalcIncome.prototype.agentRebate = function (agent, callback) {
    // id, userId, level
    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getUserById(agent.id, cb);
        }, function (user, cb) {
            if (!user) {
                return;
            }
            var playerIds = JSON.parse(user.friends);
            if (!playerIds) {
                return;
            }
            async.map(playerIds, self.getPlayerTodayIncome.bind(self), function (err, incomes) {
                async.reduce(incomes, {betMoney: 0, incomeMoney: 0, defection:0}, function (reduce, item, callback) {
                    reduce.betMoney += item.betMoney;
                    reduce.incomeMoney += item.incomeMoney;
                    reduce.defection += item.defection;
                    callback(null, reduce);

                }, function (err, income) {

                    var rebateMoney = 0; //分成
                    var rate = agent.ext.divide;
                    //盈亏金额
                    var incomeMoney = (-income.incomeMoney) - income.defection;
                    if (incomeMoney < 0) {
                        rebateMoney = Math.abs(incomeMoney) * rate/100;
                    }

                    self.daoIncome.agentAddIncome({
                        playerId: agent.playerId,
                        betMoney: income.betMoney,
                        incomeMoney: income.incomeMoney,
                        rebateRate: rate,
                        rebateMoney: rebateMoney,
                        incomeTime: begin_time.getTime()
                    }, function (err, res) {
                        if (err) {
                            logger.error('run addIncome failed!' + err.stack);
                            return;
                        }
                        callback(null, res);
                    });

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
    if (income.rebateMoney > 0) {
        this.daoUser.updateAccountAmount(income.playerId, income.rebateMoney, callback);
    }
};

CalcIncome.prototype.playersCalc = function () {
    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getPlayersIncomeId(cb);
        },
        function (incomeIds, cb) {
            async.map(incomeIds, self.playerDefection.bind(self), cb);
        }, function (playerIncomes, cb) {
            async.map(playerIncomes, self.playerIncomeInsertAccount.bind(self), cb);
        }

    ], function (err) {
        if (err) {
            logger.error('玩家今日反水存在异常!' + err);
            return;
        }
        logger.info('玩家今日反水计算完成');
        self.agentsCalc();
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
            async.map(agents, self.agentRebate.bind(self), cb);
        },
        function (agentsIncomes, cb) {
            async.map(agentsIncomes, self.agentsRebateInsertAccount.bind(this), cb);
        }
    ], function (err) {
        if (err) {
            logger.error('代理商今日分成存在异常' + err);
            return;
        }
        logger.info('代理商今日分成计算完成');
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
        {name: "daoIncome", ref: "daoIncome"},
        {name: "utils", ref: "utils"}
    ]
}