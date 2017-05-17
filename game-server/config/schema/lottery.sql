

# ------------------------------------------------------------
# Dump of table User(用户表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `User` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录名',
  `password` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '登录密码',
  `phone` varchar(11) COLLATE utf8_unicode_ci NOT NULL COMMENT '电话',
  `email` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '邮箱',
  `from` varchar(25) COLLATE utf8_unicode_ci DEFAULT NULL COMMENT '登录来源',
  `regTime` bigint(20) unsigned NOT NULL COMMENT '注册时间',
  `inviter` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '邀请人',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_ACCOUNT_NAME` (`name`, `phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# Dump of table Task(任务表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Task` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `playerId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `kindId` bigint(20) unsigned NOT NULL DEFAULT '0',
  `taskState` smallint(6) unsigned DEFAULT '0',
  `startTime` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `taskData` varchar(1000) COLLATE utf8_unicode_ci DEFAULT '{}',
  PRIMARY KEY (`id`),
  KEY `INDEX_TASK_ID` (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


# ------------------------------------------------------------
# Dump of table Player(玩家表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `Player` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL COMMENT '用户id',
  `roleName` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '角色名称',
  `sex` smallint(6) unsigned NOT NULL COMMENT '性别 1男 2女',
  `pinCode` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '取款密码',
  `accountAmount` smallint(6) unsigned NOT NULL COMMENT '账户金额',
  `level` smallint(6) unsigned NOT NULL COMMENT '等级',
  `experience` smallint(11) unsigned NOT NULL COMMENT '经验值',
  `loginCount` smallint(6) unsigned NOT NULL COMMENT '登录次数',
  `lastOnlineTime` bigint(20) unsigned NOT NULL COMMENT '最后在线时间',
  `areaId` bigint(20) unsigned NOT NULL COMMENT '场景id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_PALYER_USER_ID` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table HonoraryTitle(荣誉称号)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `HonoraryTitle`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `level` smallint(6) unsigned NOT NULL COMMENT '等级',
  `title` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '称号',
    PRIMARY KEY (`id`),
    UNIQUE KEY `INDEX_LEVEL_IDENTIFY` (`level`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table FriendRelation(朋友关系表)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `FriendRelation`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `fromId` bigint(20) unsigned NOT NULL COMMENT '用户id',
  `toId` bigint(20) unsigned NOT NULL COMMENT '朋友id',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_FRIEND_IDENTIFY` (`fromId`, `toId`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table BettingInformation(用户投注信息)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `BettingInformation`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `userId` bigint(20) unsigned NOT NULL COMMENT '用户id',
  `period` bigint(20) unsigned NOT NULL COMMENT '期数',
  `info` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '投注操作',
  `operate` smallint(6) unsigned NOT NULL COMMENT '0 撤消，1 确认',
  `investmentMoney` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '投注金额',
  `harvestMoney` bigint(20) unsigned NOT NULL DEFAULT '0' COMMENT '收益金额',
  `time` bigint(20) unsigned DEFAULT '0' COMMENT '投注时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `INDEX_PALYER_USER_ID` (`userId`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table LotteryHistory(开奖历史)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `LotteryHistory`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `period` bigint(20) unsigned NOT NULL COMMENT '期数',
  `result` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '开奖结果',
  `time` bigint(20) unsigned DEFAULT '0' COMMENT '开奖时间',
   PRIMARY KEY (`id`),
   UNIQUE KEY `INDEX_PERIOD_IDENTIFY` (`period`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

# ------------------------------------------------------------
# Dump of table ChatRoom(聊天室)
# ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `ChatRoom`(
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `roomNO` bigint(20) unsigned NOT NULL COMMENT '房号',
  `roomName` varchar(50) COLLATE utf8_unicode_ci NOT NULL COMMENT '房间名称',
  `max` bigint(20) unsigned DEFAULT '10000' COMMENT '房间最大承载',
  `enable` tinyint(1)  DEFAULT '1' COMMENT '是否启用',
   PRIMARY KEY (`id`),
   UNIQUE KEY `INDEX_ROOMNO_IDENTIFY` (`roomNO`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;