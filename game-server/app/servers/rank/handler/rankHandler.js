/**
 * Created by linyng on 17-5-24.
 */

var bearcat = require('bearcat');
var Answer = require('../../../../../shared/answer');
var Code = require('../../../../../shared/code');

var RankHandler = function (app) {
    this.app = app;
    this.utils = null;
    this.consts = null;
    this.rankService = null;
};

//胜率排行
RankHandler.prototype.winRateRankList = function (msg, session, next) {
    next(null, new Answer.DataResponse(Code.OK, this.rankService.getWinRankList()));
};

//今日土豪榜
RankHandler.prototype.todayRichRankList = function (msg, session, next) {
    next(null, new Answer.DataResponse(Code.OK, this.rankService.richRankList()));
};

module.exports = function (app) {
    return bearcat.getBean({
        id: "rankHandler",
        func: RankHandler,
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
