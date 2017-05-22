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
}

module.exports = {
    id: "consts",
    func: Consts
}