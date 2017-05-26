/**
 *Module dependencies
 */

var util = require('util');

/**
 * Initialize a new 'User' with the given 'opts'.
 *
 * @param {Object} opts
 * @api public
 */

var User = function(opts) {
	this.id = opts.id;
	this.username = opts.username;
    this.from = opts.from;
	this.password = opts.password;
	this.email = opts.email;
    this.invitor = opts.invitor;
    this.phone = opts.phone;
	this.regTime = opts.regTime;
};

/**
 * Expose 'Entity' constructor
 */

module.exports = User;
