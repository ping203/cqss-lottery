/**
 * Created by linyng on 17-5-23.
 */

function Income() {
};

Income.prototype.init = function () {
    this.rate = new Map();
};

/**
 * update the config data
 * @param config
 */
Income.prototype.update = function (configs) {
    var self = this;
    configs.forEach(function (val) {
        self.rate.set(val.type, val.multiple);
    });
};

Income.prototype.getMultiple = function (type) {
    var val = this.rate.get(type);
    if(!val) val = 10;
    return val;
};

module.exports = {
    id:"income",
    func:Income,
    init:"init"
};