/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const http = require('http');
const async = require('async');
const pomelo = require('pomelo');

function LotteryService() {
    this.syncTimeTickCount = 0;
    this.latestPeriod = null;
    this.latestOpenTime = 0;
    this.latestOpenOriTime = 0;
    this.autoLearServerOpenTime = {minute:1,second:20};
    this.latestOpenInfo = null;
};

LotteryService.prototype.init = function () {
    setInterval(this.tick.bind(this), 2000);
    let configs = pomelo.app.get('redis');
    this.redisApi.init(configs);
};

LotteryService.prototype.pubMsg = function (event, msg) {
    this.redisApi.pub(event, JSON.stringify(msg));
    logger.error('~~~~~~~~~~~~~', event, ':', msg);
};

LotteryService.prototype.tick = function () {
    var self = this;
    this.getOfficialLotteryInfo(function (err, result) {
        if (err || !result) {
            logger.error('获取彩票信息失败', err);
            return;
        }

        if (!self.latestPeriod || (!!self.latestPeriod && self.latestPeriod != result.last.period)) {
            self.pubMsg('publishLottery', result);
            self.pubMsg('openLottery', {period:result.last.period, numbers:result.last.numbers.split(',')});
            self.latestPeriod = result.last.period;
            self.latestOpenTime = result.next.opentime.getTime();
            self.latestOpenOriTime = result.next.oriTime.getTime();
            self.timeSync(result.tickTime);
        }

        if(self.tickCount > 10){
            self.timeSync(result.tickTime);
        }

        self.tickCount++;
    });
};

// 修正开奖倒计时
LotteryService.prototype.timeSync = function (tickTime) {
    var sysTickTime = new Date(tickTime);
    var tick = (this.latestOpenTime - sysTickTime) / 1000;
    this.pubMsg('tickTimeSync', {tick:tick});
    this.tickCount = 0;

};

// 自动修正下次开奖时间
LotteryService.prototype.collateTime = function (tick_time) {
    var nextTime = new Date(tick_time);
    nextTime.setMinutes(nextTime.getMinutes() + this.autoLearServerOpenTime.minute);
    nextTime.setSeconds(nextTime.getSeconds() + this.autoLearServerOpenTime.second);
    return nextTime;
};

LotteryService.prototype.getOfficialLotteryInfo = function (callback) {
    var self = this;
    async.parallel([
            function (cb) {
                self.cqss.getServerTime(cb);
            },
            function (cb) {
                self.cqss.getPreInfo(cb);
            },
            function (cb) {
                self.cqss.getNextInfo(cb);
            }
        ],
        function (err, results) {
            if(!!err){
                self.utils.invokeCallback(callback, err, null);
                return;
            }

            var lotteryInfo = {};
            lotteryInfo.identify = 'cqss';

            var serverTime = results[0];
            lotteryInfo.tickTime = serverTime;

            var preInfos = results[1];
            if(Number(preInfos[0].period) < Number(self.latestPeriod)){
                return;
            }

            self.latestOpenInfo = preInfos;

            var nextInfo = results[2];
            var next_ori_time = new Date(nextInfo.time);
            var col_time = self.collateTime(nextInfo.time);

            lotteryInfo.next = {period: nextInfo.period, opentime: col_time, oriTime: next_ori_time};

            lotteryInfo.last = {
                period: preInfos[0].period,
                opentime: preInfos[0].time,
                numbers: preInfos[0].numbers
            };

            if(self.latestPeriod != preInfos[0].period && self.latestOpenOriTime != 0){
                var open_time = new Date(serverTime);
                var sub_sec = (open_time.getTime() - self.latestOpenOriTime)/1000;
                if(sub_sec > 0){
                    self.autoLearServerOpenTime.minute = Math.floor(sub_sec/60);
                    self.autoLearServerOpenTime.second = (sub_sec%60 -3);
                    logger.info('---------------------------------------- auto learn open time:',self.autoLearServerOpenTime.minute+':'+self.autoLearServerOpenTime.second);
                }
            }

            lotteryInfo.pre = {
                period: preInfos[1].period,
                opentime: preInfos[1].time,
                numbers: preInfos[1].numbers
            };

            self.utils.invokeCallback(callback, null, lotteryInfo);
        });
};

module.exports = {
    id: "lotteryService",
    func: LotteryService,
    props: [
        {name: "consts", ref: "consts"},
        {name: "utils", ref: "utils"},
        {name: "cqss", ref: "cqss"},
        {name:'redisApi', ref:'redisApi'}
    ]
}
