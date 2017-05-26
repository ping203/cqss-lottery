/**
 * Created by linyng on 17-5-23.
 */

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
BetLimitCfg.prototype.update = function (config) {
    var self = this;
    config.single.forEach(function (vals) {
        self.singleMap.set(vals.type, vals.limit);
    });

    config.player.forEach(function (vals) {
        self.playerMap.set(vals.type, vals.limit);
    });

    config.platform.forEach(function (vals) {
        self.platformMap.set(vals.type, vals.limit);
    });
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
    init:"init"
};