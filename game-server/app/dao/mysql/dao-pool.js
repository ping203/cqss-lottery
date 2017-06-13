/**
 * Created by linyng on 2017/4/20.
 */

var mysql = require('mysql');

var createMysqlPool = function (app) {
    var configs = app.get('mysql');
    var pool  = mysql.createPool({
        connectionLimit : 10,
        host     : configs.host,
        user     : configs.user,
        password : configs.password,
        database : configs.database
    });
    return pool;
};

exports.createMysqlPool = createMysqlPool;


