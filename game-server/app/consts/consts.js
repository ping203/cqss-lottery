var Consts = function () {
    this.RES_CODE = {
        SUC_OK: 1, // success
        ERR_FAIL: -1, // Failded without specific reason
        ERR_USER_NOT_LOGINED: -2, // User not login
        ERR_CHANNEL_DESTROYED: -10, // channel has been destroyed
        ERR_SESSION_NOT_EXIST: -11, // session not exist
        ERR_CHANNEL_DUPLICATE: -12, // channel duplicated
        ERR_CHANNEL_NOT_EXIST: -13 // channel not exist
    };

    this.MESSAGE = {
        RES: 200,
        ERR: 500,
        PUSH: 600
    };

    this.ChatMsgType = {
        CHARACTERS:0,
        IMAGE:1,
        AUDIO:2,
        isSupported:function(type){
            if(type >= 0 && type <= 2){
                return true;
            }
            return false;
        }
    }

    this.EntityType = {
        PLAYER: 'player',
        LOTTERY: 'lottery',
        MOB: 'mob',
        EQUIPMENT: 'equipment',
        ITEM: 'item',
        BAG: 'bag',
        BETS:'bets'
    };

    this.Event = {
        chat:{
            chatMessage: 'onChatMessage',
            enterRoom: 'onEnterRoom',
            leaveRoom: 'onLeaveRoom'
        },
        area:{
            playerLeave:'onPlayerLeave',
            playerBet:'onPlayerBet',
            playerUnBet:'onPlayerUnBet',
            playerRename:'onPlayerRename',
            playerUpgrade:'onPlayerUpgrade',
            addEntities:'onAddEntities',
            removeEntities:'onRemoveEntities',
            countdown:'onCountdown',
            lottery:'onLottery',
            notice:'onNotice'
        }
    };

    this.TaskState = {
        COMPLETED:2,
        COMPLETED_NOT_DELIVERY:1,
        NOT_COMPLETED:0,
        NOT_START:-1
    };

    this.LotteryType = {
        A:"A",
        B:"B",
        C:"C"
    }

    // 0 待开奖，1 撤销，2 已经开奖
    this.BetState = {
        BET_WAIT:0,
        BET_CANCLE:1,
        BET_OPENNED:2
    }

    this.BetType = {
        TotalSize:{
            code:1,
            desc:'总和大小'
        }, //和大小 (大100)  (小100)
        TotalSingleDouble:{
            code:2,
            desc:'总和单双'
        }, //和单双 (单100  双100)
        DragonAndTiger:{
            code:3,
            desc:'龙虎'
        }, //龙虎 (龙100 虎100)
        Equal15:{
            code:4,
            desc:'合/和'
        }, //合/和玩法 (和100 合100)  （大单龙和60）
        PerPosSizeSingleDouble:{
            code:5,
            desc:'每球大小单双'
        }, //每个位置大小单双 (1／大双／100)
        PerPosValue:{
            code:6,
            desc:'每球数值'
        }, //每个位置值 (124/579/90)  组合(124/大单579/90)
        ContainValue:{
            code:7,
            desc:'包数字'
        }, //包数字 （75/100） （8/100）
        Panther:{
            code:8,
            desc:'豹子'
        }, //豹子、数字玩法 （豹100）代表前中后豹子各买100 （豹/100/50/80） 代表前豹子 100元 中豹子50 元 后豹子 80元 （豹顺100） 代表前中后顺子和豹子各买100元 一共下注6注 投注金600元
        ShunZi:{
            code:9,
            desc:'顺子'
        } //顺子
    }
}

module.exports = {
    id: "consts",
    func: Consts
}