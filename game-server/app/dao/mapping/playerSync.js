/**
 * Created by linyng on 2017/4/24.
 */
//http://blog.csdn.net/wangqiuyun/article/details/10083127
//https://github.com/youyudehexie/lordofpomelo/wiki
module.exports =  {
    updatePlayer:function(client, player, cb) {
        var sql = 'update Player set roleName = ? ,rank = ? , sex = ?, pinCode = ? , accountAmount = ?, level = ?, experience = ?, loginCount = ?, lastOnlineTime = ?, areaId = ? where id = ?';
        var args = [player.roleName, player.rank, player.sex, player.pinCode, player.accountAmount, player.level, player.experience, player.loginCount, player.lastOnlineTime, player.areaId, player.id];
        client.query(sql, args, function(err, res) {
            if(err !== null) {
                console.error('write mysql Player failed!　' + sql + ' ' + JSON.stringify(player) + ' stack:' + err.stack);
            }
            if(!!cb && typeof cb == 'function') {
                cb(!!err);
            }
        });
    }
};