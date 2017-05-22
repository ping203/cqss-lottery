/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');

var DaoBets = function () {

};

DaoBets.prototype.addBet = function (bet, cb) {
    var sql = 'insert into Bets (playerId,period,identify,betInfo,state,investmentMoney,multiple,harvestMoney,betTime) values(?,?,?,?,?,?,?,?,?)';
    var args = [bet.playerId, bet.period, bet.identify, bet.betInfo, bet.state, bet.investmentMoney, bet.multiple, 0, Date.now()];

    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            this.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            var betItem = bearcat.getBean("betItem", {
                id: res.insertId,
                period:bet.period,
                identify:bet.identify,
                numbers:bet.numbers,
                openTime:bet.openTime
            });

            this.utils.invokeCallback(cb, null, betItem);
        }
    });
};

DaoBets.prototype.getBets = function (skip, limit, cb) {
    var sql = 'select * from Bets limit ?,?';
    var args = [skip,limit];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length >= 1) {
                var items =[];
                for (var i = 0; i< res.length;++i){
                    var betItem = bearcat.getBean("betItem", {
                        id: res[i].id,
                        period:res[i].period,
                        identify:res[i].identify,
                        numbers:res[i].numbers,
                        openTime:res[i].openTime
                    });
                    items.push(betItem);
                }

                this.utils.invokeCallback(cb, null, items);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

module.exports ={
    id:"daoBets",
    func:DaoBets,
    props:[
        {name:"utils", ref:"utils"}
    ]
}