
// `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
//     `username` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录名',
//     `password` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录密码',
//     `phone` varchar(11) COLLATE utf8_unicode_ci NOT NULL COMMENT '电话',
//     `email` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '邮箱',
//     `from` varchar(25) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录来源',
//     `regTime` bigint(20) unsigned NOT NULL COMMENT '注册时间',
//     `inviter` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '邀请人',
//     `active` tinyint(1) unsigned DEFAULT '0' COMMENT '是否激活',
//     `forbidTalk` tinyint(1) unsigned DEFAULT '0' COMMENT '玩家禁言',
//     `friends` json DEFAULT NULL COMMENT '朋友列表',
//     `role` smallint(6) unsigned NOT NULL COMMENT '0 玩家，1 代理商，2 管理员',
//     `roleName` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '角色名称',
//     `imageId` smallint(6) unsigned DEFAULT '1' COMMENT '头像id(1~6)',
//     `rank` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '荣誉称号',
//     `sex` smallint(6) unsigned NOT NULL COMMENT '性别 1男 2女',
//     `pinCode` varchar(50) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '取款密码',
//     `accountAmount` smallint(6) unsigned NOT NULL COMMENT '账户金额',
//     `level` smallint(6) unsigned NOT NULL COMMENT '等级(1~10)',
//     `experience` smallint(11) unsigned DEFAULT '0' COMMENT '经验值',
//     `loginCount` smallint(6) unsigned DEFAULT '0' COMMENT '登录次数',
//     `lastLoinTime` bigint(20) unsigned DEFAULT NULL COMMENT '最后登录时间',

var User = function(opts) {
	this.id = opts.id;
	this.username = opts.username;
    this.password = opts.password;
    this.phone = opts.phone;
    this.email = opts.email;
    this.from = opts.from;
	this.regTime = opts.regTime;
    this.inviter = opts.inviter;
	this.active = opts.active;
	this.forbidTalk = opts.forbidTalk;
	this.friends = opts.friends;
    this.role = opts.role;
    this.roleName = opts.roleName;
    this.imageId = opts.imageId;
    this.rank = opts.rank;
	this.sex = opts.sex;
    this.pinCode = opts.pinCode;
	this.accountAmount = opts.accountAmount;
    this.level = opts.level;
    this.experience = opts.experience;
    this.loginCount = opts.loginCount;
    this.lastLoinTime = opts.lastLoinTime;

};

/**
 * Expose 'Entity' constructor
 */

module.exports = User;
