/**
 * Created by linyng on 17-5-23.
 */

// odds 投注賠率设置 玩家等级高一级提升0.1
// msg 公告
// initial 玩家初始金币
//
// rank 称号等级标准
//
// limit 个人投注记录历史显示天数
//
// norm 投注限额设置 p 平台 m 用户
// bw 玩家反水设置

// size 大小单双龙虎
// sz 顺子
// bz 豹子
// num 数字（包数字，买数字）
// sum 和

// {
//     odds: “{“size”:{“min”:”1.0”,”max”:”2.0”},”sz”:{“min”:”10”,”max”:”20”},”bz”:{“min”:”60”,”max”:”90”},”num”:{“min”:”9”,”max”:”10”},”sum”:{“min”:”9”,”max”:”10”}}”,
//     msg: “123”,
//     initial: “1”,
//     rank: “[“1”,”2”,”3”,”4”,”5”,”6”,”7”,”8”,”9”,”1”]”,
//     limit: “11”,
//     norm: “{“size”:{“p”:”100000”,”m”:”3000”},”sz”:{“p”:”200000”,”m”:”2000”},”bz”:{“p”:”600000”,”m”:”6000”},”num”:{“p”:”100000”,”m”:”3000”},”sum”:{“p”:”200000”,”m”:”2000”}}”,
//     bw: “[“1”,”5”,”10”,”15”,”20”,”25”,”30”,”35”,”40”,”45”]”
// }
//
// odds 反水设置
// size 大小单双龙虎
// sz 顺子
// bz 豹子
// num 数字（包数字，买数字）
// sum 和
//
// msg 公告
//
// initial 玩家初始金币
//
// rank 称号等级标准
//
// limit 历史显示天数
//
// norm 投注限额设置
//
// size 大小单双龙虎 p 平台 m 用户
// sz 顺子
// bz 豹子
// num 数字（包数字，买数字）
// sum 和
//
// bw 反水设置
//
// 下标对应等级

function BetLimitCfg() {

};

BetLimitCfg.prototype.init = function () {
    this.singleMap = new Map();
    this.playerMap = new Map();
    this.platformMap = new Map();
};

/**
 * update the config data
 * @param config
 */
BetLimitCfg.prototype.update = function (configs) {
    for(var type in configs){
        switch (type){
            case 'size':
                this.singleMap.set(this.consts.BetType.BetSize.code, configs[type].s);
                this.singleMap.set(this.consts.BetType.BetSingleDouble.code, configs[type].s);
                this.singleMap.set(this.consts.BetType.DragonAndTiger.code, configs[type].s);

                this.playerMap.set(this.consts.BetType.BetSize.code, configs[type].m);
                this.playerMap.set(this.consts.BetType.BetSingleDouble.code, configs[type].m);
                this.playerMap.set(this.consts.BetType.DragonAndTiger.code, configs[type].m);

                this.platformMap.set(this.consts.BetType.BetSize.code, configs[type].p);
                this.platformMap.set(this.consts.BetType.BetSingleDouble.code, configs[type].p);
                this.platformMap.set(this.consts.BetType.DragonAndTiger.code, configs[type].p);
                break;
            case 'sz':
                this.singleMap.set(this.consts.BetType.ShunZi.code, configs[type].s);
                this.playerMap.set(this.consts.BetType.ShunZi.code, configs[type].m);
                this.platformMap.set(this.consts.BetType.ShunZi.code, configs[type].p);
                break;
            case 'bz':
                this.singleMap.set(this.consts.BetType.Panther.code, configs[type].s);
                this.playerMap.set(this.consts.BetType.Panther.code, configs[type].m);
                this.platformMap.set(this.consts.BetType.Panther.code, configs[type].p);
                break;
            case 'num':
                this.singleMap.set(this.consts.BetType.number.code, configs[type].s);
                this.playerMap.set(this.consts.BetType.number.code, configs[type].m);
                this.platformMap.set(this.consts.BetType.number.code, configs[type].p);
                break;
            case 'sum':
                this.singleMap.set(this.consts.BetType.Equal15.code, configs[type].s);
                this.playerMap.set(this.consts.BetType.Equal15.code, configs[type].m);
                this.platformMap.set(this.consts.BetType.Equal15.code, configs[type].p);
                break;
            default:
                break;
        }
    }
};

BetLimitCfg.prototype.getSingleValue = function (type) {
    var val = this.singleMap.get(type);
    if(!val) val =300;
    return val;
}

BetLimitCfg.prototype.singleLimit = function (type, value) {
    var val = this.singleMap.get(type);
    if(!val) val =300;
    if(!!val && val >= value){
        return false;
    }

    return true;
};

BetLimitCfg.prototype.getPlayerValue = function (type) {
    var val = this.playerMap.get(type);
    if(!val) val = 1000;
    return val;
}

BetLimitCfg.prototype.playerLimit = function (type, value) {
    var val = this.playerMap.get(type);
    if(!val) val = 1000;
    if(!!val && val >= value){
        return false;
    }

    return true;
};

BetLimitCfg.prototype.getPlatfromValue = function (type) {
    var val = this.platformMap.get(type);
    if(!val) val = 3000;
    return val;
};

BetLimitCfg.prototype.platformLimit = function (type, value) {
    var val = this.platformMap.get(type);
    if(!val) val = 3000;
    if(!!val && val >= value){
        return false;
    }
    return true;
};

module.exports = {
    id:"betLimitCfg",
    func:BetLimitCfg,
    init:"init",
    props:[
        {name:'consts',ref:'consts'}
    ]
};