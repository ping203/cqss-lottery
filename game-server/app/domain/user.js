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
	this.name = opts.name;
    this.from = opts.from;
	this.password = opts.password;
	this.email = opts.email;
    this.inviteAccount = opts.inviteAccount;
    this.phone = opts.phone;
	this.regTime = opts.regTime;
};

/**
 * Expose 'Entity' constructor
 */

module.exports = User;
