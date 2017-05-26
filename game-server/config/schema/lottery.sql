# ------------------------------------------------------------
# Dump of table User(用户表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `User` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录名',
  `password` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录密码',
  `phone` varchar(11) COLLATE utf8_unicode_ci NOT NULL COMMENT '电话',
  `email` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '邮箱',
  `from` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '登录来源',
  `regTime` bigint(20) unsigned NOT NULL COMMENT '注册时间',
  `inviter` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '邀请人',
  `active` tinyint(1) unsigned NOT NULL COMMENT '是否激活',
  `friends` JSON COMMENT '朋友列表',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_ACCOUNT_NAME` (`username`, `phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table Player(玩家表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Player` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL COMMENT '用户id',
  `roleName` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '角色名称',
  `imageId` smallint(6) unsigned NOT NULL COMMENT '头像id',
  `rank` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT 'rank',
  `sex` smallint(6) unsigned NOT NULL COMMENT '性别 1男 2女',
  `pinCode` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '取款密码',
  `accountAmount` smallint(6) unsigned NOT NULL COMMENT '账户金额',
  `level` smallint(6) unsigned NOT NULL COMMENT '等级',
  `experience` smallint(11) unsigned NOT NULL COMMENT '经验值',
  `loginCount` smallint(6) unsigned NOT NULL COMMENT '登录次数',
  `lastLoinTime` bigint(20) unsigned NOT NULL COMMENT '最后登录时间',
  `areaId` bigint(20) unsigned NOT NULL COMMENT '场景id',
  `forbidTalk` tinyint(1) unsigned NOT NULL COMMENT '玩家禁言',
  `role` smallint(6) unsigned NOT NULL COMMENT '0 玩家，1 代理商，2 管理员',
  PRIMARY KEY (`id`),
  FOREIGN KEY(`playerId`) REFERENCES User(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table BettingInformation(用户投注信息)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Bets`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL COMMENT '玩家ID',
  `period` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '期数',
  `identify` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '标志',
  `betInfo` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '投注信息{type:0,value:0}',
  `state` smallint(6) unsigned NOT NULL COMMENT '0 待开奖，1 撤销，2 已经开奖',
  `betCount` smallint(6) unsigned NOT NULL COMMENT '投注数',
  `winCount` smallint(6) unsigned NOT NULL COMMENT '投赢注数',
  `betMoney` bigint(20) unsigned NOT NULL COMMENT '投注金额',
  `winMoney` bigint(20) unsigned NOT NULL COMMENT '收益金额',
  `betTime` bigint(20) unsigned NOT NULL COMMENT '投注时间',
  PRIMARY KEY (`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table Lottery(开奖历史)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Lottery`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `period` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '期数',
  `identify` varchar(20) COLLATE utf8_unicode_ci NOT NULL COMMENT '标志',
  `numbers` varchar(10) COLLATE utf8_unicode_ci NOT NULL COMMENT '开奖结果',
  `openTime` bigint(20) unsigned NOT NULL COMMENT '开奖时间',
   PRIMARY KEY (`id`),
   UNIQUE KEY `INDEX_PERIOD_IDENTIFY` (`period`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table Income(投注盈亏表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Income`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL COMMENT '玩家ID',
  `betMoney` bigint(20) unsigned NOT NULL COMMENT '投注金额',
  `incomeMoney` bigint(20) NOT NULL COMMENT '盈亏金额',
  `defection` bigint(20) unsigned NOT NULL COMMENT '反水',
  `rebateRate` float(6.2) NOT NULL COMMENT '分成比例',
  `rebateMoney` bigint(20) NOT NULL COMMENT '分成金额',
  `incomeTime` bigint(20) unsigned NOT NULL COMMENT '收益日期',
   PRIMARY KEY (`id`),
   FOREIGN KEY(`playerId`) REFERENCES Player(`id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;