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
        var user = {id: rs.id, name: rs.name, password: rs.password, phone: rs.phone, email:rs.email, from:rs.from,regTime:rs.regTime,inviter:rs.inviter}
        cb(null, user);
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
                var rs = res[0];
                var user = {id: rs.id, name: rs.name, password: rs.password, phone: rs.phone, email:rs.email, from:rs.from,regTime:rs.regTime,inviter:rs.inviter}
                cb(null, user);
            } else {
                cb(null, null);
            }
        }
    });
}

/**
 * Create a new user
 * @param (String) username
 * @param {String} password
 * @param {String} from Register source
 * @param {function} cb Call back function.
 */
daoUser.createUser = function (username, password, phone, inviter, from, cb){
  var sql = 'insert into User (name,password,phone,email,`from`,regTime,inviter) values(?,?,?,?,?,?,?)';
  var regTime = Date.now();
  var args = [username, password, phone,"", from, regTime,inviter];

  mysql.insert(sql, args, function(err,res){
    if(err !== null){
      cb({code: err.number, msg: err.message}, null);
    } else {
      var user = {id: res.insertId, name: username, password: password, phone: phone, email:"", from:from,regTime:regTime,inviter:inviter};
      cb(null, user);
    }
  });
};



