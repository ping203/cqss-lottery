/**
 * Created by linyng on 2017/4/24.
 */

module.exports = {
    updatePlayer: function (client, player, cb) {
        var sql = 'update User set roleName = ? ,imageId=?,rank = ? , pinCode = ? , accountAmount = ?,' +
            ' level = ?,experience = ?, loginCount = ?, lastLoinTime = ?, forbidTalk = ?, email =?, ext =?, phone=? where id = ?';
        var args = [player.roleName, player.imageId, player.rank, player.pinCode, player.accountAmount,
            player.level, player.experience, player.loginCount, player.lastLoinTime, player.forbidTalk,
            !!player.email, player.ext, player.phone, player.id];
        client.query(sql, args, function (err, res) {
            if (err !== null) {
                console.error('write mysql Player failed!　' + sql + ' ' + JSON.stringify(player) + ' stack:' + err.stack);
            }
            if (!!cb && typeof cb == 'function') {
                cb(!!err);
            }
        });
    }
};