/**
 * Created by linyng on 2017/4/21.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');
var async = require('async');
var User = require('../domain/user');


var DaoUser = function () {
    this.utils = null;
};
/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
DaoUser.prototype.createUser = function (username, password, phone, inviter, from, cb){
    var sql = 'insert into User (name,password,phone,email,`from`,regTime,inviter) values(?,?,?,?,?,?,?)';
    var regTime = Date.now();
    var args = [username, password, phone,"", from, regTime,inviter];

    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            this.utils.invokeCallback(cb, {code: err.number, msg: err.message}, null);
        } else {
            var user = new User({id: res.insertId, name: username, password: password, phone: phone, email:"", from:from,regTime:regTime,inviter:inviter});
            this.utils.invokeCallback(cb, null, user);
        }
    });
};

/**
 * delete user by username
 * @param {String} username
 * @param {function} cb Call back function.
 */
DaoUser.prototype.deleteByName = function (username, cb){
    var sql = 'delete from	User where username = ?';
    var args = [username];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb,err.message, null);
        } else {
            if (!!res && res.affectedRows>0) {
                this.utils.invokeCallback(cb,null,true);
            } else {
                this.utils.invokeCallback(cb,null,false);
            }
        }
    });
};

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
DaoUser.prototype.getUserByName = function (username, cb){
    var sql = 'select * from	User where username = ?';
    var args = [username];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var rs = res[0];
                var user = new User({id: rs.id, name: rs.name, password: rs.password, phone: rs.phone, email:rs.email, from:rs.from,regTime:rs.regTime,inviter:rs.inviter});
                this.utils.invokeCallback(cb, null, user);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};

DaoUser.prototype.getUserByPhone = function(phone, cb){
    var sql = 'select * from  User where phone = ?';
    var args = [phone];

    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                var rs = res[0];
                var user = new User({id: rs.id, name: rs.name, password: rs.password, phone: rs.phone, email:rs.email, from:rs.from,regTime:rs.regTime,inviter:rs.inviter});
                this.utils.invokeCallback(cb, null, user);
            } else {
                this.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
}


/**
 * get user infomation by userId
 * @param {String} uid UserId
 * @param {function} cb Callback function
 */
DaoUser.prototype.getUserById = function (uid, cb){
    var sql = 'select * from	User where id = ?';
    var args = [uid];
    var self = this;

    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            self.utils.invokeCallback(cb,err.message, null);
            return;
        }

        if (!!res && res.length > 0) {
            self.utils.invokeCallback(cb, null, new User(res[0]));
        } else {
            self.utils.invokeCallback(cb, ' user not exist ', null);
        }
    });
};

/**
 * Get user data by username.
 * @param {String} username
 * @param {String} passwd
 * @param {function} cb
 */
DaoUser.prototype.getUserInfo = function (username, passwd, cb) {
    var sql = 'select * from	User where username = ?';
    var args = [username];

    pomelo.app.get('dbclient').query(sql,args,function(err, res) {
        if(err !== null) {
            this.utils.invokeCallback(cb, err, null);
        } else {
            var userId = 0;
            if (!!res && res.length === 1) {
                var rs = res[0];
                userId = rs.id;
                rs.uid = rs.id;
                this.utils.invokeCallback(cb,null, rs);
            } else {
                this.utils.invokeCallback(cb, null, {uid:0, username: username});
            }
        }
    });
};


/**
 * Create a new player
 * @param {String} uid User id.
 * @param {String} name Player's name in the game.
 * @param {Number} roleId Player's roleId, decide which kind of player to create.
 * @param {function} cb Callback function
 */
DaoUser.prototype.createPlayer = function (uid, roleName, sex, cb){
    var self = this;
    var sql = 'insert into Player (userId, roleName, sex, pinCode,accountAmount,level,experience,loginCount,lastOnlineTime,areaId) values(?,?,?,?,?,?,?,?,?,?)';
    var loginTime = Date.now();
    var playerData = this.dataApiUtil.player().findById(211);

    var args = [uid, roleName, sex, playerData.pinCode,playerData.accountAmount,playerData.level,playerData.experience,playerData.loginCount,loginTime,playerData.areaId];

    pomelo.app.get('dbclient').insert(sql, args, function(err,res){
        if(err !== null){
            logger.error('create player failed! ' + err.message);
            logger.error(err);
            this.utils.invokeCallback(cb,err.message, null);
        } else {
            let player = bearcat.getBean("player", {
                id: res.insertId,
                userId: uid,
                roleName: roleName,
                sex:sex,
                pinCode:playerData.pinCode,
                accountAmount:playerData.accountAmount,
                level:playerData.level,
                experience:playerData.experience,
                loginCount:playerData.loginCount,
                lastOnlineTime:loginTime,
                areaId:playerData.areaId
            });
            self.utils.invokeCallback(cb,null,player);
        }
    });
};

/**
 * Update a player
 * @param {Object} player The player need to update, all the propties will be update.
 * @param {function} cb Callback function.
 */
DaoUser.prototype.updatePlayer = function (player, cb){
    var sql = 'update Player set x = ? ,y = ? , hp = ?, mp = ? , maxHp = ?, maxMp = ?, country = ?, rank = ?, level = ?, experience = ?, areaId = ?, attackValue = ?, defenceValue = ?, walkSpeed = ?, attackSpeed = ? , skillPoint = ? where id = ?';
    var args = [player.x, player.y, player.hp, player.mp, player.maxHp, player.maxMp, player.country, player.rank, player.level, player.experience, player.areaId, player.attackValue, player.defenceValue, player.walkSpeed, player.attackSpeed, player.skillPoint, player.id];

    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb,err.message, null);
        } else {
            if (!!res && res.affectedRows>0) {
                this.utils.invokeCallback(cb,null,true);
            } else {
                logger.error('update player failed!');
                this.utils.invokeCallback(cb,null,false);
            }
        }
    });
};

/**
 * Delete player
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
DaoUser.prototype.deletePlayer = function (playerId, cb){
    var sql = 'delete from	Player where id = ?';
    var args = [playerId];
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb,err.message, null);
        } else {
            if (!!res && res.affectedRows>0) {
                this.utils.invokeCallback(cb,null,true);
            } else {
                this.utils.invokeCallback(cb,null,false);
            }
        }
    });
};

/**
 * Get an user's all players by userId
 * @param {Number} uid User Id.
 * @param {function} cb Callback function.
 */
DaoUser.prototype.getPlayersByUid = function(uid, cb){
    var sql = 'select * from Player where userId = ?';
    var args = [uid];
    var self = this;

    pomelo.app.get('dbclient').query(sql,args,function(err, res) {
        if(err) {
            self.utils.invokeCallback(cb, err.message, null);
            return;
        }

        if(!res || res.length <= 0) {
            self.utils.invokeCallback(cb, null, null);
            return;
        } else {
            self.utils.invokeCallback(cb, null, res);
        }
    });
};

/**
 * Get an user's all players by userId
 * @param {Number} playerId
 * @param {function} cb Callback function.
 */
DaoUser.prototype.getPlayer = function(playerId, cb){
    var sql = 'select * from Player where id = ?';
    var args = [playerId];

    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            this.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0){
            this.utils.invokeCallback(cb,null,[]);
            return;
        } else{
            this.utils.invokeCallback(cb,null, bearcat.getBean("player",res[0]));
        }
    });
};

/**
 * get by Name
 * @param {String} name Player name
 * @param {function} cb Callback function
 */
DaoUser.prototype.getPlayerByName = function(name, cb){
    var sql = 'select * from Player where name = ?';
    var args = [name];
    var self = this;
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if (err !== null){
            self.utils.invokeCallback(cb, err.message, null);
        } else if (!res || res.length <= 0){
            self.utils.invokeCallback(cb, null, null);
        } else{
            self.utils.invokeCallback(cb,null, bearcat.getBean("player",res[0]));
        }
    });
};

/**
 * Get all the information of a player, include equipments, bag, skills, tasks.
 * @param {String} playerId
 * @param {function} cb
 */
DaoUser.prototype.getPlayerAllInfo = function (playerId, cb) {
    async.parallel([
            function(callback){
                daoUser.getPlayer(playerId, function(err, player) {
                    if(!!err || !player) {
                        logger.error('Get user for daoUser failed! ' + err.stack);
                    }
                    callback(err,player);
                });
            },
            function(callback) {
                equipmentsDao.getEquipmentsByPlayerId(playerId, function(err, equipments) {
                    if(!!err || !equipments) {
                        logger.error('Get equipments for eqipmentDao failed! ' + err.stack);
                    }
                    callback(err,equipments);
                });
            },
            function(callback) {
                bagDao.getBagByPlayerId(playerId, function(err, bag) {
                    if(!!err || !bag) {
                        logger.error('Get bag for bagDao failed! ' + err.stack);
                    }
                    callback(err,bag);
                });
            },
            function(callback) {
                fightskillDao.getFightSkillsByPlayerId(playerId, function(err, fightSkills) {
                    if(!!err || !fightSkills){
                        logger.error('Get skills for skillDao failed! ' + err.stack);
                    }
                    callback(err, fightSkills);
                });
            },
            function(callback){
                taskDao.getCurTasksByPlayId(playerId, function(err, tasks) {
                    if(!!err) {
                        logger.error('Get task for taskDao failed!');
                    }
                    callback(err, tasks);
                });
            }
        ],
        function(err, results) {
            var player = results[0];
            var equipments = results[1];
            var bag = results[2];
            var fightSkills = results[3];
            var tasks = results[4];
            player.bag = bag;
            player.setEquipments(equipments);
            player.addFightSkills(fightSkills);
            player.curTasks = tasks || {};

            if (!!err){
                this.utils.invokeCallback(cb,err);
            }else{
                this.utils.invokeCallback(cb,null,player);
            }
        });
};

module.exports ={
    id:"daoUser",
    func:DaoUser,
    props:[
        {name:"utils", ref:"utils"},
        {name:"dataApiUtil", ref:"dataApiUtil"}
    ]
}



