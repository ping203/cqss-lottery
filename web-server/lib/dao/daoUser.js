var mysql = require('./mysql/mysql');

var daoUser = module.exports;

/**
 * Get userInfo by username
 * @param {String} username
 * @param {function} cb
 */
daoUser.getUserByName = function (username, cb){
  var sql = 'select * from  User where name = ?';
  var args = [username];
  mysql.query(sql,args,function(err, res){
    if(err !== null){
      cb(err.message, null);
    } else {
      if (!!res && res.length === 1) {
        var rs = res[0];
        var user = {id: rs.id, name: rs.name, password: rs.password, phone: rs.phone, email:rs.email, from:rs.from,regTime:rs.regTime,inviteAccount:rs.inviteAccount}
        cb(null, user);
      } else {
        cb(' user not exist ', null);
      }
    }
  });
};

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
daoUser.createUser = function (username, password, phone, inviteId, from, cb){
  var sql = 'insert into User (name,password,phone,email,`from`,regTime,inviteAccount) values(?,?,?,?,?,?,?)';
  var regTime = Date.now();
  var args = [username, password, phone,"", from, regTime,inviteId,];

  mysql.insert(sql, args, function(err,res){
    if(err !== null){
      cb({code: err.number, msg: err.message}, null);
    } else {
      var user = {id: res.insertId, name: username, password: password, phone: phone, email:"", from:from,regTime:regTime,inviteAccount:inviteId};
      cb(null, user);
    }
  });
};



