/**
 * Created by linyng on 2017/4/21.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');
var async = require('async');

var DaoUser = function () {
    this.utils = null;
};

// 获取玩家基本信息
DaoUser.prototype.getPlayer = function (playerId, cb) {
    var sql = 'select * from User where id = ?';
    var args = [playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, []);
        } else {
            self.utils.invokeCallback(cb, null, bearcat.getBean("player", res[0]));
        }
    });
};

// 获取我的好友
DaoUser.prototype.getMyFriends = function (playerId, cb) {
    var sql = 'select friends from User where id = ?';
    var args = [playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, []);
        } else {
            self.utils.invokeCallback(cb, null, res[0].friends);
        }
    });
};

// 获取玩家综合信息
DaoUser.prototype.getPlayerAllInfo = function (playerId, cb) {
    var self = this;
    async.parallel([
            function (callback) {
                self.getPlayer(playerId, function (err, player) {
                    if (!!err || !player) {
                        logger.error('Get user for daoUser failed! ' + err.stack);
                    }
                    callback(err, player);
                });
            },
            function (callback) {
                self.daoBets.getBetStatistics(playerId, function (err, betStatistics) {
                    if (!!err) {
                        logger.error('Get task for taskDao failed!');
                    }
                    callback(err, betStatistics);
                });
            }
        ],
        function (err, results) {
            var player = results[0];
            var betStatistics = results[1];

            player.setBetStatistics(betStatistics);

            if (!!err) {
                self.utils.invokeCallback(cb, err);
            } else {
                self.utils.invokeCallback(cb, null, player);
            }
        });
};


DaoUser.prototype.getPlayersIncomeId = function (cb) {
    var sql = 'select id,level from User';
    var args = [];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, []);
        } else {
            self.utils.invokeCallback(cb, null, res);
        }
    });
};

DaoUser.prototype.getPlayersRankId = function (cb) {
    var sql = 'select id,roleName from User';
    var args = [];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, []);
        } else {
            self.utils.invokeCallback(cb, null, res);
        }
    });
};


DaoUser.prototype.updateAccountAmount = function (playerId, add, cb) {
    var sql = 'update User set accountAmount = accountAmount + ?  where id = ?';
    var args = [add, playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            logger.error('更新账户金额失败,',err);
            self.utils.invokeCallback(cb, err.message, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                self.utils.invokeCallback(cb, null, true);
            } else {
                logger.error('updateAccountAmount player failed!');
                self.utils.invokeCallback(cb, null, false);
            }
        }
    });
};

DaoUser.prototype.getAccountAmount = function (playerId, cb) {
    var sql = 'select  accountAmount from User where id = ?';
    var args = [playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length > 0) {
                self.utils.invokeCallback(cb, null, res[0].accountAmount);
            } else {
                logger.error('updateAccountAmount player failed!');
                self.utils.invokeCallback(cb, 'user not exist', null);
            }
        }
    });
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
DaoUser.prototype.getUserByName = function (username, cb) {
    var sql = 'select * from	User where username = ?';
    var args = [username];
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var rs = res[0];
                var user = new User({
                    id: rs.id,
                    name: rs.name,
                    password: rs.password,
                    phone: rs.phone,
                    email: rs.email,
                    from: rs.from,
                    regTime: rs.regTime,
                    inviter: rs.inviter
                });
                this.utils.invokeCallback(cb, null, user);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

DaoUser.prototype.getUserByPhone = function (phone, cb) {
    var sql = 'select * from  User where phone = ?';
    var args = [phone];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var rs = res[0];
                var user = new User({
                    id: rs.id,
                    name: rs.name,
                    password: rs.password,
                    phone: rs.phone,
                    email: rs.email,
                    from: rs.from,
                    regTime: rs.regTime,
                    inviter: rs.inviter
                });
                this.utils.invokeCallback(cb, null, user);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
}

DaoUser.prototype.getAgents = function (cb) {
    var sql = 'select id, ext from User where role != ?';
    var args = [this.consts.RoleType.PLAYER];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length >= 1) {

                var agents = [];
                for (let i = 0; i< res.length; i++){
                    agents.push({
                        id:res[i].id,
                        ext:JSON.parse(res[i].ext)
                    })
                }
                self.utils.invokeCallback(cb, null,agents);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
DaoUser.prototype.updatePlayer = function (player, cb) {
    var sql = 'update Player set roleName = ? ,imageId=?,rank = ? , sex = ?, pinCode = ? , accountAmount = ?, level = ?,' +
        ' experience = ?, loginCount = ?, lastLoinTime = ?, areaId = ?,forbidTalk = ? where id = ?';
    var args = [player.roleName, player.imageId, player.rank, player.sex, player.pinCode, player.accountAmount,
        player.level, player.experience, player.loginCount, player.lastLoinTime, player.areaId, player.forbidTalk, player.id];

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.affectedRows > 0) {
                this.utils.invokeCallback(cb, null, true);
            } else {
                logger.error('update player failed!');
                this.utils.invokeCallback(cb, null, false);
            }
        }
    });
};

/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
DaoUser.prototype.getPlayersByUid = function (uid, cb) {
    var sql = 'select * from Player where userId = ?';
    var args = [uid];
    var self = this;

    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err) {
            self.utils.invokeCallback(cb, err.message, null);
            return;
        }

        if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, null);
            return;
        } else {
            self.utils.invokeCallback(cb, null, res);
        }
    });
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
DaoUser.prototype.getPlayerByName = function (name, cb) {
    var sql = 'select * from Player where name = ?';
    var args = [name];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, null);
        } else {
            self.utils.invokeCallback(cb, null, bearcat.getBean("player", res[0]));
        }
    });
};


module.exports = {
    id: "daoUser",
    func: DaoUser,
    props: [
        {name: "utils", ref: "utils"},
        {name: "dataApiUtil", ref: "dataApiUtil"},
        {name: "daoBets", ref: "daoBets"},
        {name: "consts", ref: "consts"},
    ]
}



