/**
 * Created by linyng on 17-5-22.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');
var bearcat = require('bearcat');
var async = require('async');

var DaoSysParamConfig = function () {

};

DaoSysParamConfig.prototype.initPlatformParam = function (configs, callback) {
    var self = this;
    var sysConfig = null;
    async.waterfall([function (cb) {
        var sql = 'insert into config values(?,?)';
        var args = [1, JSON.stringify(configs)];
        pomelo.app.get('dbclient').insert(sql, args, function(err,res){
            if(err !== null){
                cb(null,null);
            } else {
                cb(null, configs);
            }
        });
    },function (res,cb) {
        if(res){
            sysConfig = res;
            cb();
        }
        else {
            var sql = 'select * from config where id = ?';
            var args = [1];

            pomelo.app.get('dbclient').query(sql,args,function(err, res){
                if(err !== null){
                    cb(err);
                } else {
                    if (!!res && res.length === 1) {
                        sysConfig = JSON.parse(res[0].info);
                        cb();
                    } else {
                        cb('sys config not exist');
                    }
                }
            });

        }
    }],function (err) {
        if(err){
            self.utils.invokeCallback(callback, err, null);
        }
        else {
            self.utils.invokeCallback(callback, null, sysConfig);
        }
    });

};

DaoSysParamConfig.prototype.getLottery = function (period, cb) {
    var sql = 'select * from Lottery where period = ?';
    var args = [period];
    var self = this;
    pomelo.app.get('dbclient').query(sql,args,function(err, res){
        if(err !== null){
            self.utils.invokeCallback(cb, err.message, null);
        } else {
            if (!!res && res.length === 1) {
                self.utils.invokeCallback(cb, null, res[0]);
            } else {
                self.utils.invokeCallback(cb, ' user not exist ', null);
            }
        }
    });
};


module.exports ={
    id:"daoSysParamConfig",
    func:DaoSysParamConfig,
    props:[
        {name:"utils", ref:"utils"}
    ]
}