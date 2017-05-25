/**
 * Created by linyng on 2017/4/24.
 */

module.exports =  {
    updateBet:function(client, item, cb) {
        var sql = 'update Bets set playerId = ? ,period = ? ,identify = ? ,betInfo = ?, state= ? ,investmentMoney = ? ,multiple = ?, harvestMoney = ?, harvestMultiple = ?, betTime = ? where id = ?';
      //  var items = bet.getSyncItems();
        var args = [item.playerId, item.period, item.identify, item.betInfo, item.state, item.investmentMoney, item.multiple, item.harvestMoney, item.harvestMultiple, item.betTime, item.id];
        client.query(sql, args, function(err, res) {
            if(err !== null) {
                console.error('write mysql Bets failed!　' + sql + ' ' + JSON.stringify(item) + ' stack:' + err.stack);
            }
            if(!!cb && typeof cb == 'function') {
                cb(!!err);
            }
        });
    }
};