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
};

// 获取投注翻倍率
IncomeCfg.prototype.getBetRate = function (type) {
    var values = this.betRate.get(type);
    if(!!values){
        return values;
    }
    return 0;
};

// 获取玩家反水倍率
IncomeCfg.prototype.getDefectionRate = function (level) {
    var val = this.defectionRate.get(level);
    if(!val) val = 10.0;
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