/**
 * Created by linyng on 2017/4/24.
 */
//http://blog.csdn.net/wangqiuyun/article/details/10083127
//https://github.com/youyudehexie/lordofpomelo/wiki
module.exports =  {
    updateBet:function(client, player, cb) {
        var sql = 'update Bag set items = ? where id = ?';
        var items = val.items;
        if (typeof items !== 'string') {
            items = JSON.stringify(items);
        }
        var args = [items, val.id];

        dbclient.query(sql, args, function (err, res) {
            if (err) {
                console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(val));
            }
            if(!!cb && typeof cb == 'function') {
                cb(!!err);
            }
        });
    }
};