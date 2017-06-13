/**
 * Created by linyng on 2017/4/20.
 */

var sqlclient = module.exports;

var _pool;

var NND = {};

NND.init = function(app){
    _pool = require('./dao-pool').createMysqlPool(app);

    // _pool.on('acquire', function (connection) {
    //     console.log('Connection %d acquired', connection.threadId);
    // });
    //
    // _pool.on('connection', function (connection) {
    //     connection.query('SET SESSION auto_increment_increment=1')
    // });
    //
    // _pool.on('enqueue', function () {
    //     console.log('Waiting for available connection slot');
    // });
    //
    // _pool.on('release', function (connection) {
    //     console.log('Connection %d released', connection.threadId);
    // });
};

NND.query = function(sql, args, callback){
    _pool.getConnection(function(err, connection) {
        if(!!connection){
            connection.query(sql, args, function (error, results, fields) {
                connection.release();
                callback.apply(null, [error, results]);
            });
        }
        else {
            callback.apply(null, [err, null]);
        }
    });
};

NND.shutdown = function(){
    _pool.end(function (err) {
        // all connections in the pool have ended
        console.log('all connections in the pool have ended')
    });

};

sqlclient.init = function(app) {
    if (!!_pool){
        return sqlclient;
    } else {
        NND.init(app);
        sqlclient.insert = NND.query;
        sqlclient.update = NND.query;
        sqlclient.delete = NND.query;
        sqlclient.query = NND.query;
        return sqlclient;
    }
};

sqlclient.shutdown = function(app) {
    NND.shutdown(app);
};













