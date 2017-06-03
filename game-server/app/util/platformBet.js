/**
 * Created by linyng on 2017/6/2.
 */

var Answer = require('../../../shared/answer');
var Code = require('../../../shared/code');

var PlatformBet = function () {
    this.platformTypeBet = new Map();
};

PlatformBet.prototype.canBet = function (type, value) {
    var num = this.platformTypeBet.get(type);
    var newNum = (!!num ? num : 0) + value;

    var err = {};
    var freeBetValue = 0;
    if (this.betLimitCfg.platformLimit(type, newNum)) {
        freeBetValue = this.betLimitCfg.getPlatfromValue(type) - num;
        err = Code.GAME.FA_BET_PLATFORM_LIMIT;
    }
    else {
        freeBetValue = this.betLimitCfg.getPlatfromValue(type) - newNum;
        err = Code.OK;
    }

    return new Answer.DataResponse(err, {freeBetValue: freeBetValue});
};

PlatformBet.prototype.addBet = function (type, value) {
    var num = this.platformTypeBet.get(type);
    var newNum = (!!num ? num : 0) + value;
    this.platformTypeBet.set(type, newNum);
    var freeBetValue = this.betLimitCfg.getPlatfromValue(type) - newNum;
    return freeBetValue;
};

PlatformBet.prototype.reduceBet = function (type, value) {
    var num = this.platformTypeBet.get(type);
    var newNum = (!!num ? num : 0) - value;
    if (newNum < 0) {
        logger.error('reducePlatfromBet < 0');
        return;
    }
    this.platformTypeBet.set(type, newNum);
    var freeBetValue = this.betLimitCfg.getPlatfromValue(type) - newNum;
    return freeBetValue;
};

PlatformBet.prototype.resetBet = function () {
    this.platformTypeBet.clear();
};

module.exports = {
    id:"platformBet",
    func:PlatformBet,
    props:[
        {name:"betLimitCfg",ref:"betLimitCfg"}
    ]
}