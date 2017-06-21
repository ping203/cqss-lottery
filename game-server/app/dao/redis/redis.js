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

let REDIS_DEFAULT_PREFIX = 'LOTTERY';

RedisApi.prototype.init = function(app){
    let configs = app.get('redis');
    this.prefix = configs.prefix || REDIS_DEFAULT_PREFIX;
    this.db = configs.db || '0';
    this._redis = redis.createClient(configs.port, configs.host, configs.opts);
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

RedisApi.prototype.invokeCallback = function(cb) {
    if (!!cb && typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

RedisApi.prototype.cmd = function(cmd, key, value, cb){
    if(!cmd) {
        this.invokeCallback(cb);
        return;
    }

    let cmds =[];
    cmds.push([cmd, genKey(this, key, value)]);

    this._redis.multi(cmds).exec(function(err, reply) {
        this.invokeCallback(cb, err, reply);
    });
};

RedisApi.shutdown = function(){
    if(this._redis) {
        this._redis.end();
        this._redis = null;
    }
};

var genKey = function(self, id) {
    return self.prefix + ':' + id;
};

var genCleanKey = function(self) {
    return self.prefix + '*';
};

const RedisClient = module.exports;

RedisClient.init = function(app) {
    if (!!RedisClient.redis){
        return RedisClient;
    } else {
        RedisClient.redis = new RedisApi;
        RedisClient.redis.init(app);
        RedisClient.add = RedisClient.redis.add;
        RedisClient.get = RedisClient.redis.get;
        RedisClient.del = RedisClient.redis.del;
        return RedisClient;
    }
};

RedisClient.shutdown = function(app) {
    RedisClient.redis.shutdown(app);
};













