/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const http = require('http');
const async = require('async');
const pomelo = require('pomelo');

function RestoreService() {

};

RestoreService.prototype.init = function () {
  //  setInterval(this.tick.bind(this), 2000);
    let configs = pomelo.app.get('redis');
    this.redisApi.init(configs);
    this.restore();

    var self = this;
    this.redisApi.sub('revertBet', function (msg) {
        logger.error('~~~~~~~~~~revertBet~~~~~~~~~~~~~`', msg);
        self.revert(period);
    });
};

RestoreService.prototype.pubMsg = function (event, msg) {
    this.redisApi.pub(event, JSON.stringify(msg));
};

RestoreService.prototype.manualOpen = function (period, numbers) {
    this.pubMsg('manualOpen', {period:period, numbers:numbers});
};

// 如果官方超过3分钟未开出结果，则退还所有玩家投注金额
RestoreService.prototype.revert = async function (period) {
    let revertBets = await this.daoBets.getRevertBets(period);
    let playerWinMoneys = {};
    revertBets.forEach(function (bet) {
        if(bet.getState() === this.consts.BetState.BET_WAIT){
            this.eventManager.addEvent(item);
            bet.setState(this.consts.BetState.BET_CANCLE);
            bet.save();
            if(!playerWinMoneys[bet.playerId]){
                playerWinMoneys[bet.playerId] = 0;
            }
            playerWinMoneys[bet.playerId] += bet.getBetMoney();
        }
    });

    let self = this;
    for (let id in playerWinMoneys){
        this.daoUser.updateAccountAmount(Number(id), playerWinMoneys[id], function (err, result) {
            if(err || !result){
                return;
            }
            self.pubMsg('restoreBetMoney', {playerId:Number(id), betWinMoney:playerWinMoneys[id]});
        });
    }
};

//服务器重启或关闭，重启后，继续开奖之前投注信息
RestoreService.prototype.restore = async function () {
    let lotteryHistory = await this.getHistory();
    if(!lotteryHistory){
        return;
    }

    let self = this;
    let lotteryMap = {};
    lotteryHistory.map(function (item) {
        let openCodeResult = self.calcOpenLottery.calc(item.numbers.split(','));
        item.openCodeResult = openCodeResult;
        lotteryMap[item.period] = item;
    });

    let playerWinMoneys = {};
    let except_bets = await this.daoBets.getExceptBets(lotteryHistory[0].period);
    if(!except_bets){
        return;
    }

    logger.error('~~~~~~~~~~except_bets~~~~~~~~~~~~~`', except_bets.length, ':',except_bets);
    except_bets.forEach(function (bet) {
        if(lotteryMap[bet.period] && bet.getState() === self.consts.BetState.BET_WAIT){
            self.eventManager.addEvent(bet);
            bet.calcHarvest(lotteryMap[bet.period].openCodeResult);
            var subMoney = Number((bet.getWinMoney() - bet.getBetMoney()).toFixed(2));
            if(subMoney > 0){
                bet.setState(self.consts.BetState.BET_WIN);
            }
            else {
                bet.setState(self.consts.BetState.BET_LOSE);
            }

            bet.save();
            if(!playerWinMoneys[bet.playerId]){
                playerWinMoneys[bet.playerId] = 0;
            }
            playerWinMoneys[bet.playerId] += bet.getWinMoney();
        }
    });

    for (let id in playerWinMoneys){
        if(playerWinMoneys[id] === 0) continue;
        this.daoUser.updateAccountAmount(Number(id), playerWinMoneys[id], function (err, result) {
            if(err || !result){
                return;
            }
            self.pubMsg('restoreBetMoney', {playerId:Number(id), betWinMoney:playerWinMoneys[id]});
        });
    }
};

RestoreService.prototype.getHistory = function () {
    let self = this;
    let promise = new Promise(resolve=>{
        self.cqss.getPreInfo(function (err, result) {
            if(err){
                logger.error('获取开奖历史失败:', err);
            }
            resolve(result);
        });
    });

    return promise;
};


module.exports = {
    id: "restoreService",
    func: RestoreService,
    props: [
        {name: "consts", ref: "consts"},
        {name: "utils", ref: "utils"},
        {name: "cqss", ref: "cqss"},
        {name: "daoBets", ref: "daoBets"},
        {name: "daoUser", ref: "daoUser"},
        {name: "calcOpenLottery", ref: "calcOpenLottery"},
        {name: "eventManager", ref: "eventManager"},
        {name:'redisApi', ref:'redisApi'}
    ]
}

