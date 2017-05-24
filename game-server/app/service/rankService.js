/**
 * Created by linyng on 17-5-24.
 */

var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'AreaService');
var EventEmitter = require('events').EventEmitter;
var bearcat = require('bearcat');
var pomelo = require('pomelo');
var schedule = require('node-schedule');
var async = require('async');


var RankService = function () {
    this.winRankPlayers = [];
    this.richRankPlayers = [];
};

RankService.prototype.init = function () {
    setInterval(this.tick.bind(this), 500);
};

RankService.prototype.getWinRankList = function () {
    return this.winRankPlayers;
};

RankService.prototype.richRankList = function () {
    return this.richRankPlayers;
};

RankService.prototype.winRateCalc = function (rankId, callback) {
    var rankPlayer = {rankId:rankId, betCount:0,winCount:0,winRate:0.0};
    var self = this;
    this.daoBets.getBetStatistics(rankId.id, function (err, result) {
        if(!!result && result.betCount >0){
            rankPlayer.betCount = result.betCount;
            rankPlayer.winCount = result.winCount;
            rankPlayer.winRate = Number((result.winCount/result.betCount).toFixed(2));//Math.round((result.winCount/result.betCount)*100/100)
        }
        self.utils.invokeCallback(callback, null, rankPlayer);
    });
};

RankService.prototype.todayRichCalc = function (rankId, callback) {
    var rankPlayer = {rankId:rankId, betMoney:0};
    var self = this;
    this.daoBets.getPlayerTodayBets(rankId.id, function (err, result) {
        if(!!result){
            rankPlayer.betMoney = !!result.betMoney?result.betMoney:0;
        }
        self.utils.invokeCallback(callback, null, rankPlayer);
    });
};

RankService.prototype.tick = function() {
    //run all the action
    //console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    var self = this;
    async.waterfall([
        function (cb) {
            self.daoUser.getPlayersRankId(cb);
        },
        function (rankIds, cb) {
            async.map(rankIds, self.winRateCalc.bind(self), function (err, rankPlayers) {
                if (err) {
                    logger.error('run winRateCalc failed!' + err);
                    return;
                }
                rankPlayers.sort(function (rankPlayerA, rankPlayerB) {
                    return rankPlayerA.winRate < rankPlayerB.winRate;
                });
                self.winRankPlayers = rankPlayers.slice(0,100).map(function (rankPlayer) {
                    return rankPlayer;
                });
            });

            async.map(rankIds, self.todayRichCalc.bind(self), function (err, rankPlayers) {
                if (err) {
                    logger.error('run todayRichCalc failed!' + err);
                    return;
                }
                rankPlayers.sort(function (rankPlayerA, rankPlayerB) {
                    return rankPlayerA.betMoney < rankPlayerB.betMoney;
                });
                self.richRankPlayers = rankPlayers.slice(0,200).map(function (rankPlayer) {
                    return rankPlayer;
                });
            });
            cb(null);
        }
    ]);

};

module.exports = {
    id:"rankService",
    func:RankService,
    init:"init",
    props:[
        {
            name: "utils",
            ref: "utils"
        }, {
            name: "consts",
            ref: "consts"
        }, {
            name: "daoUser",
            ref: "daoUser"
        }, {
            name: "daoBets",
            ref: "daoBets"
        }
    ]
}