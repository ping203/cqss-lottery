/**
 * Created by linyng on 2017/6/23.
 */

const logger = require('pomelo-logger').getLogger(__filename);
const bearcat = require('bearcat');

var RestoreRemote = function (app) {
    this.app = app;
};

// 手动开奖
RestoreRemote.prototype.manualOpen = function (period, numbers, cb) {
    this.app.restoreService.manualOpen(period, numbers);
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "restoreRemote",
        func: RestoreRemote,
        args: [{
            name: "app",
            value: app
        }],
        props: [{
            name: "restoreService",
            ref: "restoreService"
        }]
    });
}