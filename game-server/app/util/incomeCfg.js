/**
 * Created by linyng on 17-5-23.
 */

function IncomeCfg() {
};

IncomeCfg.prototype.init = function () {
    //投注赔率
    this.betRate = new Map();
    //玩家反水
    this.defectionRate = new Map();
    //代理分成
    this.rebateRate = new Map();
};

/**
 * update the config data
 * @param config
 */
IncomeCfg.prototype.update = function (configs) {

    for (var type in configs.betRates){
        switch (type){
            case 'size':
                this.betRate.set(this.consts.BetType.BetSize.code, configs.betRates[type]);
                this.betRate.set(this.consts.BetType.BetSingleDouble.code, configs.betRates[type]);
                this.betRate.set(this.consts.BetType.DragonAndTiger.code, configs.betRates[type]);
                break;
            case 'sz':
                this.betRate.set(this.consts.BetType.ShunZi.code, configs.betRates[type]);
                break;
            case 'bz':
                this.betRate.set(this.consts.BetType.Panther.code, configs.betRates[type]);
                break;
            case 'num':
                this.betRate.set(this.consts.BetType.number.code, configs.betRates[type]);
                break;
            case 'sum':
                this.betRate.set(this.consts.BetType.Equal15.code, configs.betRates[type]);
                break;
            default:
                break;
        }
    }

    for (var index = 0; index < configs.defectionRates.length; ++index){
        this.defectionRate.set(index+1,configs.defectionRates[index]);
    }

    this.rebateRate.set(1, 30);
    this.rebateRate.set(2, 15);
};

// 获取投注翻倍率
IncomeCfg.prototype.getBetRate = function (type, level) {
    var values = this.betRate.get(type);
    var sub = values.max - values.min;
    var step = sub/10;

    var rate = 0;
    rate = values.min + step*(level-1);

    if(rate > values.max){
        rate = values.max;
    }
    return rate;
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
    init:"init",
    props:[
        {name:"consts", ref:"consts"}
    ]
};