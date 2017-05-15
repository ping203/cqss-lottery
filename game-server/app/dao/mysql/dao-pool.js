/**
 * Created by linyng on 2017/4/20.
 */

var _poolModule = require('generic-pool');
var mysql = require('mysql');

var mysqlConfig;

const factory = {
    create: function(){
        return new Promise(function(resolve, reject){
            var client = mysql.createConnection({
                host: mysqlConfig.host,
                user: mysqlConfig.user,
                password: mysqlConfig.password,
                database: mysqlConfig.database
            });
            resolve(client);
        });
    },
    destroy: function(client){
        return new Promise(function(resolve){
            client.end();
            resolve();
        });
    }
};

var opts = {
    max: 10, // maximum size of the pool
    min: 2, // minimum size of the pool
    idleTimeoutMillis : 30000,
    log : false,
    name     : 'mysql',
};

/*
 * Create mysql connection pool.
 */


var createMysqlPool = function (app) {
    mysqlConfig = app.get('mysql');

    return _poolModule.createPool(factory, opts);
};

exports.createMysqlPool = createMysqlPool;


