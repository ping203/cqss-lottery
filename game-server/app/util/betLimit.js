/**
 * Created by linyng on 17-5-23.
 */

function BetLimit() {

};

BetLimit.prototype.init = function () {
    this.singleMap = new Map();
    this.playerMap = new Map();
    this.platformMap = new Map();
};

/**
 * update the config data
 * @param config
 */
BetLimit.prototype.update = function (config) {
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

BetLimit.prototype.singleLimit = function (type, value) {
    var val = this.singleMap.get(type);
    if(!!val && val <= value){
        return false;
    }

    return true;
};

BetLimit.prototype.playerLimit = function (type, value) {
    var val = this.playerMap.get(type);
    if(!!val && val <= value){
        return false;
    }

    return true;
};

BetLimit.prototype.platformLimit = function (type, value) {
    var val = this.platformMap.get(type);
    if(!!val && val <= value){
        return false;
    }

    return true;
};

module.exports = {
    id:"betLimit",
    func:BetLimit,
    init:"init"
};