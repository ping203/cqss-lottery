module.exports = {
    OK: {code:200,desc:'成功'},
    FAIL: {code:500,desc:'失败'},
    DBFAIL: {code:600,desc:'数据库访问错误'},

    PARAMERROR:{code:700, desc:'参数错误'},

    ENTRY: {
        FA_TOKEN_INVALID: 	1001,
        FA_TOKEN_EXPIRE: 	1002,
        FA_USER_NOT_EXIST: 	1003
    },

    GATE: {
        FA_NO_SERVER_AVAILABLE: 2001
    },

    CHAT: {
        FA_CHANNEL_CREATE: 		3001,
        FA_CHANNEL_NOT_EXIST: 	3002,
        FA_UNKNOWN_CONNECTOR: 	3003,
        FA_USER_NOT_ONLINE: 	3004
    },
    USER:{
        FA_USER_AREADY_EXIST:   {code:4001,descrition:'用户名已经被使用'},
        FA_PHONE_AREADY_EXIST:  {code:4002,descrition:'手机号码已经被注册'},
        FA_USER_NOT_EXIST:      {code:4003,descrition:'用户不存在'},
        FA_USER_LOGIN_ERROR:    {code:4004,desc:'用户或密码错误'},
        FA_INVITOR_NOT_EXIST:   {code:4005,desc:'推荐人不存在'}
    }
};
