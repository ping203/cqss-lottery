/**
 * Created by linyng on 17-5-24.
 */

var defaultConfigs = require('../../config/sysParamConfig.json');

var SysConfig = function () {
    this._configs = defaultConfigs;
};

SysConfig.prototype.getConfigs = function () {
    return this._configs;
};

SysConfig.prototype.setConfigs = function (configs) {
    this._configs = configs;
    this.betLimitCfg.update(this._configs.norm);
    this.incomeCfg.update({betRates:this._configs.odds, playerDefection:this._configs.bw, []}); //todo 代理商
}

//获取玩家初始化金币
SysConfig.prototype.getPlayerInitialBank = function () {
    return this._configs.initial;
}

//获取系统公告
SysConfig.prototype.getSysNotice = function () {
    return this._configs.msg;
};

//获取玩家等级头衔
SysConfig.prototype.getRank = function (level) {
    if(level > 0 && level < 10){
        return this._configs.rank[level-1];
    }

    return '等级异常';
};

// 获取个人投注历史查看天数
SysConfig.prototype.getPrivateBetDays = function (level) {
    return this._configs.limit;
};

module.exports =  {
    id:"sysConfig",
    func:SysConfig,
    props:[
        {name:"betLimitCfg",ref:"betLimitCfg"},
        {name:"incomeCfg",ref:"incomeCfg"}
    ]
}