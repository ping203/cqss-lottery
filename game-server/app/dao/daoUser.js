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
            self.utils.invokeCallback(cb, null, null);
        } else {
            self.utils.invokeCallback(cb, null, bearcat.getBean("player", res[0]));
        }
    });
};

// 通过名称获取好友
DaoUser.prototype.getPlayerByName = function (username, cb) {
    var sql = 'select * from User where username = ?';
    var args = [username];
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
            if (!!err) {
                self.utils.invokeCallback(cb, err);
            } else {
                var player = results[0];
                var betStatistics = results[1];
                player.setBetStatistics(betStatistics);
                self.utils.invokeCallback(cb, null, player);
            }
        });
};

//获取玩家收益ID
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

//获取玩家排行ID
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

//更新玩家余额
DaoUser.prototype.updateAccountAmount = function (playerId, add, cb) {
    var sql = 'update User set accountAmount = accountAmount + ?  where id = ?';
    var args = [add, playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            logger.error('更新账户金额失败,', err);
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

// 获取玩家帐号余额
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

// 设置玩家激活状态
DaoUser.prototype.setPlayerActive = function (playerId, bActive, cb) {
    var sql = 'update User set active = ?  where id = ?';
    var args = [bActive, playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        logger.error('#######################setPlayerActive err:',err,'-----:',res);
        if (err !== null) {
            self.utils.invokeCallback(cb, err, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                self.utils.invokeCallback(cb, null, true);
            } else {
                self.utils.invokeCallback(cb, null, false);
            }
        }
    });
};

// 设置玩家是否可以发言
DaoUser.prototype.setPlayerCanTalk = function (playerId, bTalk, cb) {
    var sql = 'update User set forbidTalk = ?  where id = ?';
    var args = [bTalk, playerId];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        logger.error('#######################setPlayerCanTalk err:',err,'-----:',res);
        if (err !== null) {
            self.utils.invokeCallback(cb, err, false);
        } else {
            if (!!res && res.affectedRows > 0) {
                self.utils.invokeCallback(cb, null, true);
            } else {
                self.utils.invokeCallback(cb, null, false);
            }
        }
    });
};

// 获取平台所有代理商
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
                for (let i = 0; i < res.length; i++) {
                    agents.push({
                        id: res[i].id,
                        ext: JSON.parse(res[i].ext)
                    })
                }
                self.utils.invokeCallback(cb, null, agents);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

// 获取代理商的上级代理商
DaoUser.prototype.getUpperAgent = function (playerId, cb) {
    var self = this;
    var upperAgentId = {};
        async.waterfall([
                function (callback) {
                    self.getPlayer(playerId, callback);
                },
                function (player, callback) {
                    self.getPlayerByName(player.inviter, function (err, agent) {
                        if(!!err || !agent){
                            self.utils.invokeCallback(cb, '上级代理不存在', null);
                            return;
                        }
                        upperAgentId = {
                            id: agent.id,
                            ext: JSON.parse(agent.ext)
                        };

                    });
                }
            ],
            function (err) {
                if (!!err) {
                    self.utils.invokeCallback(cb, err, null);
                } else {
                    self.utils.invokeCallback(cb, null, upperAgentId);
                }
            });

};

// 获取所以被禁言的用户ID
DaoUser.prototype.getForbidUserID = function (cb) {
    var sql = 'select * from  User where forbidTalk = ?';
    var args = [true];
    var self = this;
    pomelo.app.get('dbclient').query(sql, args, function (err, res) {
        if (err !== null) {
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length >= 1) {
                var userIds = [];
                for(let i = 0; i< res.length; ++i){
                    userIds.push(res[i].id);
                }
                self.utils.invokeCallback(cb, null, userIds);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
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



