/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);
var bearcat = require('bearcat');

var LotteryRemote = function (app) {
    this.app = app;
};

// 手动开奖
LotteryRemote.prototype.manualOpen = function (period, numbers, cb) {
    this.app.lotteryService.manualOpen(period, numbers);
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "lotteryRemote",
        func: LotteryRemote,
        args: [{
            name: "app",
            value: app
        }],
        init:"init",
        props: [{
            name: "rankService",
            ref: "rankService"
        }]
    });
}

