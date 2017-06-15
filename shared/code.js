module.exports = {
    OK: {code:200,desc:'成功'},
    FAIL: {code:500,desc:'失败'},
    DBFAIL: {code:600,desc:'数据库访问错误'},

    PARAMERROR:{code:700, desc:'参数错误'},

    ENTRY: {
        FA_TOKEN_INVALID: 	{code:1001,desc:"token无效"},
        FA_TOKEN_EXPIRE: 	{code:1002,desc:"token过期"},
        FA_USER_NOT_EXIST: 	{code:1003,desc:"用户不存在"},
        FA_USER_NOT_ACTIVE: {code:1004,desc:"用户未激活"}
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: {code:2001,desc:"没有可用的connector服务器"}
    },

    CHAT: {
        FA_CHANNEL_CREATE:      {code:3001,desc:"通道创建"},
        FA_CHANNEL_NOT_EXIST: 	{code:3002,desc:"通道不存在"},
        FA_UNKNOWN_CONNECTOR: 	{code:3003,desc:"未知连接服务器"},
        FA_USER_NOT_ONLINE: 	{code:3004,desc:"用户不在线"},
        FA_UNSUPPORT_CHAT_MSGTYPE: {code:3005,desc:"不支持的消息类型"},
        FA_CHAT_DATA_ERROR: {code:3006,desc:"聊天数据不完整"},
        FA_CHAT_FORBIDTALK: {code:3007,desc:"已被禁言"},
    },
    USER:{
        FA_USER_AREADY_EXIST:   {code:4001,desc:'用户名已经被使用'},
        FA_PHONE_AREADY_EXIST:  {code:4002,desc:'手机号码已经被注册'},
        FA_USER_NOT_EXIST:      {code:4003,desc:'用户不存在'},
        FA_USER_LOGIN_ERROR:    {code:4004,desc:'用户或密码错误'},
        FA_INVITOR_NOT_EXIST:   {code:4005,desc:'推荐人不存在'},
        FA_USER_AREADY_LOGIN:   {code:4006,desc:'用户已经登录，请勿重复登录'},
        FA_USER_SYS_CONFIG_ERR:   {code:4007,desc:'系统配置信息异常'}
    },
    GAME:{
        FA_ADD_ENTITY_ERROR: {code:5001, desc:"加入对象失败"},
        FA_PLAYER_NOT_FOUND: {code:5002, desc:"玩家不存在"},
        FA_QUERY_PLAYER_INFO_ERROR: {code:5003, desc:"查询玩家信息失败"},
        FA_QUERY_LOTTERY_INFO_ERROR: {code:5004, desc:"查询开奖信息失败"},
        FA_BET_TYPE_NOT_EXIST: {code:5005, desc:"投注类型不存在"},
        FA_BET_SINGLE_LIMIT: {code:5006, desc:"单注投注金额超限"},
        FA_BET_PLAYER_LIMIT: {code:5007, desc:"玩家投注金额超限"},
        FA_BET_PLATFORM_LIMIT: {code:5008, desc:"平台投注金额超限"},
        FA_ACCOUNTAMOUNT_NOT_ENOUGH: {code:5009, desc:"余额不足"},
        FA_BET_STATE: {code:5010, desc:"投注状态异常"},
        FA_ENTITY_NOT_EXIST: {code:5011, desc:"对象不存在"},
        FA_BET_MONEY_NOTZERO: {code:5012, desc:"投注金额不能为0"},
        FA_QUERY_INFO_IS_EMPTY: {code:5013, desc:"查詢不到指定信息"},
        FA_BET_CHANNEL_CLOSE: {code:5014, desc:"投注通道已经关闭，等待下期投注"},
        FA_RECHARGE_UID_ERROR: {code:5015, desc:"充值用户ID无效"},
        FA_CAST_ERROR: {code:5016, desc:"提现失败，余额不足"},
        FA_BET_OPERATE_INVALID: {code:5017, desc:"投注操作无效"},
        FA_MODIFY_LIMIT: {code:5018, desc:"无再次修改权限,请联系管理员"},
        FA_BET_MONEY_INTEGER: {code:5019, desc:"投注金额必须为整数"},
    }
};
