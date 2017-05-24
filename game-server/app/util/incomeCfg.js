/**
 * Created by linyng on 17-5-23.
 */

function IncomeCfg() {
};

IncomeCfg.prototype.init = function () {
    this.betRate = new Map();
    this.defectionRate = new Map();
    this.rebateRate = new Map();
};

/**
 * update the config data
 * @param config
 */
IncomeCfg.prototype.update = function (configs) {
    return;
    var self = this;
    configs.betRates.forEach(function (val) {
        self.betRate.set(val.key, val.value);
    });

    configs.playerDefection.forEach(function (val) {
        self.defectionRate.set(val.key, val.value);
    });

    configs.platformRebate.forEach(function (val) {
        self.rebateRate.set(val.key, val.value);
    });
};

// 获取投注翻倍率
IncomeCfg.prototype.getBetRate = function (type) {
    var val = this.betRate.get(type);
    if(!val) val = 10;
    return val;
};

// 获取玩家反水倍率
IncomeCfg.prototype.getDefectionRate = function (level) {
    var val = this.defectionRate.get(level);
    if(!val) val = 0.01;
    return val;
};

// 获取代理商分成
IncomeCfg.prototype.getRebateRate = function (level) {
    var val = this.rebateRate.get(level);
    if(!val) val = 0.2;
    return val;
};

module.exports = {
    id:"incomeCfg",
    func:IncomeCfg,
    init:"init"
};