/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const http = require('http');
const async = require('async');
const pomelo = require('pomelo');

function RecoveryService() {

};

RecoveryService.prototype.init = function () {
    setInterval(this.tick.bind(this), 2000);
    let configs = pomelo.app.get('redis');
    this.redisApi.init(configs);
};

//服务器重启或关闭，重启后，继续开奖之前投注信息
RecoveryService.prototype.restore = function () {

// 获取异常投注
//


};

RecoveryService.prototype.getOfficialLotteryInfo = function (callback) {
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
    id: "recoveryService",
    func: RecoveryService,
    props: [
        {name: "consts", ref: "consts"},
        {name: "utils", ref: "utils"},
        {name: "cqss", ref: "cqss"},
        {name: "daoBets", ref: "daoBets"},
        {name:'redisApi', ref:'redisApi'}
    ]
}

