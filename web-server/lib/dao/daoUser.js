const mysql = require('./mysql/mysql');
const User = require('../user');
// var random_name = require('node-random-name')

var daoUser = module.exports;

const default_role = 0;
const default_ext = {
    phone:0,
    email:0,
    pinCode:0
}

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
daoUser.createUser = function (username, password, phone, inviter, from, rank, accountAmount, active, cb){
    var sql = 'insert into User (username,password,phone,`from`, regTime, inviter,role,roleName,rank, accountAmount,friends,ext, active) values(?,?,?,?,?,?,?,?,?,?,?,?,?)';
    var regTime = Date.now(), roleName = random_name();
    var args = [username, password, phone, from, regTime,inviter, default_role, username, rank, accountAmount, "[]", JSON.stringify(default_ext), active];

    mysql.insert(sql, args, function(err,res){
        if(err !== null){
            cb({code: err.number, msg: err.message}, null);
        } else {
            cb(null, res.insertId);
        }
    });
};


/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
daoUser.getUserByName = function (username, cb){
  var sql = 'select * from  User where username = ?';
  var args = [username];
  mysql.query(sql,args,function(err, res){
    if(err !== null){
      cb(err.message, null);
    } else {
      if (!!res && res.length === 1) {
        cb(null, new User(res[0]));
      } else {
        cb(null, null);
      }
    }
  });
};

daoUser.getUserByPhone = function(phone, cb){
    var sql = 'select * from  User where phone = ?';
    var args = [phone];
    mysql.query(sql,args,function(err, res){
        if(err !== null){
            cb(err.message, null);
        } else {
            if (!!res && res.length >= 1) {
                cb(null, new User(res[0]));
            } else {
                cb(null, null);
            }
        }
    });
};

daoUser.addUserToFriendList = function (source, target, cb) {
    var sql = 'UPDATE User SET friends=json_array_append(friends,"$",?) WHERE username =?';
    var args = [source, target];
    mysql.update(sql,args,function(err, res){
        if(err !== null){
            !!cb && cb(err, null);
        } else {
            !!cb && cb(null, null);
        }
    });
};

daoUser.resetPinCode = function (username, pinCode, cb) {
    var sql = 'UPDATE User SET pinCode= ? WHERE username = ?';
    var args = [pinCode, username];
    mysql.update(sql,args,function(err, res){
        if(err !== null){
            !!cb && cb(err, false);
        } else {
            !!cb && cb(null, true);
        }
    });
};

daoUser.resetPassword = function (username, password, cb) {
    var sql = 'UPDATE User SET password= ? WHERE username = ?';
    var args = [password, username];
    mysql.update(sql,args,function(err, res){
        if(err !== null){
            !!cb && cb(err, false);
        } else {
            !!cb && cb(null, true);
        }
    });
};

