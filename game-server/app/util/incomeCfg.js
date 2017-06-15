/**
 * Created by linyng on 17-5-23.
 */
var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'IncomeCfg');

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
    logger.error('@@@@@@@@@@@@@@@@@configs', configs);
    for (var type in configs.betRates){
        switch (type){
            case 'size':
                let size_sec = this.betType.getSectionCode(type);
                logger.error('@@@@@@@@@@@@@@@@@size', size_sec);
                if(size_sec){
                    for(let i = size_sec.begin; i<= size_sec.end; i++){
                        this.betRate.set(i, Number(configs.betRates[type]));
                    }
                }
                break;
            case 'sz':
                let sz_sec = this.betType.getSectionCode(type);
                logger.error('@@@@@@@@@@@@@@@@@sz', sz_sec);
                if(sz_sec){
                    for(let i = sz_sec.begin; i<= sz_sec.end; i++){
                        this.betRate.set(i, Number(configs.betRates[type]));
                    }
                }
                break;
            case 'bz':
                let bz_sec = this.betType.getSectionCode(type);
                logger.error('@@@@@@@@@@@@@@@@@bz', bz_sec);
                if(bz_sec){
                    for(let i = bz_sec.begin; i<= bz_sec.end; i++){
                        this.betRate.set(i, Number(configs.betRates[type]));
                    }
                }
                break;
            case 'num':
                let num_sec = this.betType.getSectionCode(type);
                logger.error('@@@@@@@@@@@@@@@@@num', num_sec);
                if(num_sec){
                    for(let i = num_sec.begin; i<= num_sec.end; i++){
                        this.betRate.set(i, Number(configs.betRates[type]));
                    }
                }
                break;
            case 'sum':
                let sum_sec = this.betType.getSectionCode(type);
                logger.error('@@@@@@@@@@@@@@@@@sum', sum_sec);
                if(sum_sec){
                    for(let i = sum_sec.begin; i<= sum_sec.end; i++){
                        this.betRate.set(i, Number(configs.betRates[type]));
                    }
                }
                break;
            default:
                break;
        }
    }

    for (var index = 0; index < configs.defectionRates.length; ++index){
        this.defectionRate.set(index+1,Number(configs.defectionRates[index]));
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
        {name:"betType", ref:"betType"}
    ]
};