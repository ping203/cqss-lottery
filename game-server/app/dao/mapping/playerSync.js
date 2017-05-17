/**
 * Created by linyng on 2017/4/24.
 */
//http://blog.csdn.net/wangqiuyun/article/details/10083127
//https://github.com/youyudehexie/lordofpomelo/wiki
module.exports =  {
    updatePlayer:function(client, player, cb) {
        var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ? , maxHp = ?, maxMp = ?, country = ?, rank = ?, level = ?, experience = ?, areaId = ?, attackValue = ?, defenceValue = ?, walkSpeed = ?, attackSpeed = ? where id = ?';
        var args = [player.x, player.y, player.hp, player.mp, player.maxHp, player.maxMp, player.country, player.rank, player.level, player.experience, player.areaId, player.attackValue, player.defenceValue, player.walkSpeed, player.attackSpeed, player.id];
        client.query(sql, args, function(err, res) {
            if(err !== null) {
                console.error('write mysql failed!　' + sql + ' ' + JSON.stringify(player) + ' stack:' + err.stack);
            }
            if(!!cb && typeof cb == 'function') {
                cb(!!err);
            }
        });
    }
};