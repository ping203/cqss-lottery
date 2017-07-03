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
            self.daoBets.getPlayerBetBaseInfo(playerId.id, self.beginTime, self.endTime, function (err, res) {
                cb(null, res);
            });
        }, function (income, cb) {

            var playerDayIncomeInfo = {
                playerId: playerId.id,
                betMoney: 0,
                incomeMoney: 0,
                defection: 0,
                defectionRate: 0,
                winRate: 0.0,
                incomeTime: self.incomeTime
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
                    logger.error('写入玩家反水记录失败!' + err.stack);
                    cb('写入玩家反水记录失败');
                    return;
                }
                self.utils.invokeCallback(callback, null, res);
            })
        }
    ], function (err) {
        if (err) {
            logger.error('玩家'+playerId.id+'反水存在异常!' + err);
            self.utils.invokeCallback(callback, null, null);
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
            self.daoUser.getMyFriends(agent.id, function (err, res) {
                cb(null, res);
            });
        }, function (friends, cb) {
            var playerIds = null;
            try {
                if(!!friends){
                    playerIds = JSON.parse(friends);
                    if (!playerIds || playerIds.length === 0) {
                        playerIds = null;
                    }
                }
            }catch (e){
                playerIds = null;
            }

            var agentIncomInit = {
                playerId: agent.id,
                betMoney: 0,
                incomeMoney: 0,
                rebateRate: 0,
                rebateMoney: 0,
                incomeTime: self.incomeTime
            };

            if(!playerIds){
                self.daoAgentIncome.agentAddIncome(agentIncomInit, function (err, res) {
                    self.utils.invokeCallback(cb, null, null);
                });
                return;
            }

            async.map(playerIds, self.getPlayerTodayIncome.bind(self), function (err, incomes) {
                async.reduce(incomes, {betMoney: 0, incomeMoney: 0, defection:0}, function (reduce, item, callback) {
                    reduce.betMoney += item.betMoney;
                    reduce.incomeMoney += item.incomeMoney;
                    reduce.defection += item.defection;
                    callback(null, reduce);

                }, function (err, income) {

                    self.daoUser.getUpperAgent(agent.id, function (err, upper) {

                        var upperRebateMoney = 0; //分成
                        var rate = 0;
                        var subRate = 0;

                        if(!!err){
                            if(!!agent.ext && !!agent.ext.divide){
                                rate = agent.ext.divide;
                            }
                        }
                        else {
                            if(!!upper.ext && !!upper.ext.divide){
                                rate = upper.ext.divide;
                                subRate = upper.ext.divide - agent.ext.divide;
                            }
                        }

                        //盈亏金额
                        var incomeMoney = (-income.incomeMoney) - income.defection;
                        if (incomeMoney > 0) {
                            agentIncomInit.rebateMoney = Math.abs(incomeMoney) * rate/100;
                            if(subRate > 0){
                                upperRebateMoney = Math.abs(incomeMoney) * subRate/100;
                                agentIncomInit.rebateMoney -= upperRebateMoney;
                            }
                        }

                        agentIncomInit.betMoney = income.betMoney;
                        agentIncomInit.incomeMoney = income.incomeMoney;
                        agentIncomInit.rebateRate = rate;
                        self.daoAgentIncome.agentAddIncome(agentIncomInit, function (err, res) {
                            if (err) {
                                logger.error('代理商分成记录失败!' + err.stack);
                                cb('代理商分成记录失败');
                                return;
                            }

                            if(upperRebateMoney > 0){
                                res.upper = {playerId:upper.id, rebateMoney:upperRebateMoney};
                            }
                            self.utils.invokeCallback(callback, null, res);
                        });


                    });
                });
            });
        }
    ], function (err) {
        if (err) {
            logger.error('代理商'+agent.id+'分成存在异常!' + err);
            self.utils.invokeCallback(callback, null, null);
        }
    });
};

//玩家反水入账
CalcIncome.prototype.playerIncomeInsertAccount = function (income, callback) {
    if (!!income && income.defection > 0) {
        this.daoUser.updateAccountAmount(income.playerId, income.defection, callback);
    }
    else {
        callback(null,null);
    }
};

//代理商分成入账
CalcIncome.prototype.agentsRebateInsertAccount = function (income, callback) {
    if (!!income && income.rebateMoney > 0) {
        logger.error('~~~~~~~~~~~~玩家id:', income.playerId, '获得反水金额：', income.rebateMoney);
        this.daoUser.updateAccountAmount(income.playerId, income.rebateMoney, function (err, result) {
            if(!!income.upper && income.upper.rebateMoney > 0){
                this.daoUser.updateAccountAmount(income.upper.playerId, income.upper.rebateMoney, callback);
                logger.error('~~~~~~~~~~~~玩家id:', income.playerId,'上级代理id:',income.upper.playerId, '获得反水金额：', income.upper.rebateMoney);
            }
            else {
                callback(null,null);
            }
        });
    }else {
        callback(null,null);
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
            async.map(agentsIncomes, self.agentsRebateInsertAccount.bind(self), cb);
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
    begin.setHours(1, 55, 0, 0);
    begin.setDate(begin.getDate()-1);
    begin.setMonth(6);
    begin.setDate(30);

    this.beginTime = begin.getTime();


    var end = new Date(now);
    end.setHours(1, 55, 0, 0);
    begin.setMonth(6);
    begin.setDate(30);

    this.endTime = end.getTime();

    var calcTime = new Date(now);
    calcTime.setDate(calcTime.getDate()-1);
    calcTime.setHours(0,0,0,0);
    // begin.setMonth(6);
    // begin.setDate(30);

    this.incomeTime = calcTime.getTime();

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
        {name: "daoAgentIncome", ref: "daoAgentIncome"},
        {name: "utils", ref: "utils"}
    ]
}