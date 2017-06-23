/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);

var RecoveryRemote = function (app) {
    this.app = app;
};

// 手动开奖
RecoveryRemote.prototype.manualOpen = function (period, numbers, cb) {
    this.app.recoveryService.manualOpen(period, numbers);
};


module.exports = function (app) {
    return bearcat.getBean({
        id: "recoveryRemote",
        func: RecoveryRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [{
            name: "recoveryService",
            ref: "recoveryService"
        }]
    });
}