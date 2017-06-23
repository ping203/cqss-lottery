/**
 * Created by linyng on 2017/6/23.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var http = require('http');
var async = require('async');


function LotteryService() {
    this.syncTimeTickCount = 0;
};

LotteryService.prototype.init = function () {

};

LotteryService.prototype.timeSync = function (result) {
    var lottery = this.gameService.getLottery();
    if (!lottery) {
        return;
    }

    var sysTickTime = new Date(result.tickTime);
    //var nextOpenTime = new Date(result.next.opentime);

    var tick = (this.latestOpenTime - sysTickTime) / 1000;
    lottery.setTickCount(result.next.period, tick);
    this.tickCount = 0;
};

LotteryService.prototype.tick = function () {

};

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
                    console.log('---------------------------------------- auto learn open time:',self.autoLearServerOpenTime.minute+':'+self.autoLearServerOpenTime.second);
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
        {name: "cqss", ref: "cqss"}
    ]
}

