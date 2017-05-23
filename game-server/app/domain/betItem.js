/**
 * Created by linyng on 17-5-22.
 */

var bearcat = require('bearcat');
var util = require('util');

var BetItem = function(opts) {
    this.id = opts.id;
    this.playerId = opts.playerId;
    this.period = opts.period;
    this.identify = opts.identify;
    this.betInfo = opts.betInfo;
    this.state = opts.state;
    this.investmentMoney = opts.investmentMoney;
    this.multiple = opts.multiple;
    this.harvestMoney = 0;
    this.betTime = Date.now();
};

BetItem.prototype.parse = function () {
    
}

module.exports = {
    id:"betItem",
    func:BetItem,
    args:[{

    }],
    props:[
        {name:'betParser',ref:'betParser'}
    ]
}