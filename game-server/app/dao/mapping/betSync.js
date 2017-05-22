/**
 * Created by linyng on 2017/4/24.
 */

module.exports =  {
    updateBet:function(client, bet, cb) {
        var sql = 'update Bets set playerId = ? ,period = ? ,identify = ? ,betInfo = ?, state= ? ,investmentMoney = ? ,multiple = ?, harvestMoney = ?, betTime = ? where id = ?';
        var items = bet.getSyncItems();

        if(items.length > 0){
            items.forEach(function (val) {
                var args = [val.playerId, val.period, val.identify, val.betInfo, val.state, val.investmentMoney, val.multiple, val.harvestMoney, val.betTime, val.id];
                client.query(sql, args, function(err, res) {
                    if(err !== null) {
                        console.error('write mysql Bets failed!　' + sql + ' ' + JSON.stringify(player) + ' stack:' + err.stack);
                    }
                    if(!!cb && typeof cb == 'function') {
                        cb(!!err);
                    }
                });
            })
        }
    }
};