/**
 * Created by linyng on 2017/4/24.
 */

var logger = require('pomelo-logger').getLogger(__filename);
var pomelo = require('pomelo');

module.exports = function() {
    return new Filter();
};

var Filter = function() {
};

/**
 * Area filter
 */
Filter.prototype.before = function(msg, session, next){
    next();
};
