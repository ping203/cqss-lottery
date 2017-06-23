/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);

var LotteryRemote = function (app) {
    this.app = app;
};

// 手动开奖
LotteryRemote.prototype.manualOpen = function (period, numbers, cb) {

};


