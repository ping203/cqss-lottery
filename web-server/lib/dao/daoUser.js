var mysql = require('./mysql/mysql');
var User = require('../user');
var random_name = require('node-random-name')

var daoUser = module.exports;

const default_role = 0;
const default_rank = '江湖小虾';

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
daoUser.createUser = function (username, password, phone, inviter, from, cb){
    var sql = 'insert into User (username,password,phone,`from`, regTime, inviter,role,roleName,rank) values(?,?,?,?,?,?,?,?,?)';
    var regTime = Date.now(), roleName = random_name();
    var args = [username, password, phone, from, regTime,inviter,default_role,roleName, default_rank];

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


