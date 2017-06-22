/**
 * Created by linyng on 17-6-21.
 */

/**
 * Created by linyng on 2017/4/20.
 */
const redis = require('redis');
const logger = require('pomelo-logger').getLogger(__filename);

function RedisApi() {
    this._redis = null;
};

RedisApi.prototype.init = function(db, configs){
    this.db = db || '0';
    this._redis = redis.createClient(configs.port, configs.host, {});
    if (configs.auth) {
        this._redis.auth(configs.auth);
    }

    var self = this;
    this._redis.on("error", function (err) {
        console.error("[RedisSdk][redis]" + err.stack);
    });
    this._redis.once('ready', function(err) {
        if (!!err) {
            cb(err);
        } else {
            self._redis.select(self.db, function (err,result) {
                logger.error(err,result);
            });
        }
    });
};

RedisApi.prototype.cmd = function(cmd, table, key, value, cb){
    if(!cmd) {
        this.utils.invokeCallback(cb);
        return;
    }

    let cmdItem =[];
    cmdItem.push(cmd);

    if(table){
        cmdItem.push(table);
    }

    if(key){
        cmdItem.push(key);
    }

    if(value){
        cmdItem.push(value);
    }
   // cmds.push([cmd, genKey(this, key, value)]);

    logger.error('!!!!!!!!!!!!', cmdItem, ':::', this._redis);

    let cmds = [];
    cmds.push(cmdItem);

    let self = this;
    this._redis.multi(cmds).exec(function(err, reply) {
        self.utils.invokeCallback(cb, err, reply);
    });
};

RedisApi.shutdown = function(){
    if(this._redis) {
        this._redis.end();
        this._redis = null;
    }
};

module.exports ={
    id:'redisApi',
    func:RedisApi,
    props:[
        {name:'utils', ref:'utils'}
    ]
}












