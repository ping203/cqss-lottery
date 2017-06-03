/**
 * Created by linyng on 17-5-17.
 */

var pomelo = window.pomelo;
var players = {};

function gameMsgInit() {

    //wait message from the server.
    pomelo.on('onChatMessage', function(data) {
        console.log('onChatMessage', data);
        addMessage(data.from, data.target, data.content);
        $("#chatHistory").show();
        if(data.from !== rolename)
            tip('message', data.from);
    });

    //update user list
    pomelo.on('onEnterRoom', function(data) {
        console.log('onEnterRoom', data);
        var user = data;
        tip('online', user.roleName);
        addUser(user);
    });

    //update user list
    pomelo.on('onLeaveRoom', function(data) {
        console.log('onLeaveRoom', data);
        var user = data.uid;
        tip('offline', user);
        removeUser(user);
    });

    // add entities
    pomelo.on('onAddEntities', function (data) {
        for (var i = 0; i < data.length; ++i) {
            console.log('addEntity data:', data[i]);
            players[data[i].entityId] = data[i];
        }
    });

    //Handle remove entities message
    pomelo.on('onRemoveEntities', function (data) {
        for (var i = 0; i < data.length; ++i) {
            console.log('removeEntity data:', data[i]);
            players[data[i].entityId] = null;
        }
    });

    pomelo.on('onCountdown', function (data) {
        //  console.log('onCountdown data:', data);
        $('#countdown').html('period: ' + data.period + ' countdown: ' + Math.floor(data.tickCount) + 's');
    });

    pomelo.on('onLottery', function (data) {
        //  console.log('onLottery data:', data);
        $('#lottery').html('period: ' + data.lotteryResult.period + '  lottery: ' + data.lotteryResult.numbers);
    });

    pomelo.on('onNotice', function (data) {
          console.log('onNotice data:', data);
        //$('#lottery').html('period: ' + data.lotteryResult.period + '  lottery: ' + data.lotteryResult.numbers);
    });

    pomelo.on('onParseLottery', function (data) {
          console.log('onParseLottery data:', data);
        //$('#lottery').html('period: ' + data.lotteryResult.period + '  lottery: ' + data.lotteryResult.numbers);
    });

    pomelo.on('onPlayerChange', function (data) {
        players[data.entityId]  = data.player;
        console.log('onPlayerChange data:', data);

        var str = JSON.stringify(data.player);
        console.log(str);
        $('#playerInfo').html(str);
    });

    pomelo.on('onPlayerBet', function (data) {
        console.log('onPlayerBet data:', data.betItem.betTypeInfo,'entityid:', data.betItem.entityId);

    });

    pomelo.on('onPlayerUnBet', function (data) {
        console.log('onPlayerUnBet data:', data.betItem.betTypeInfo,'entityid:', data.betItem.entityId);

    });

    //投注数/胜率排行, 投注总资金排行
    pomelo.on('rankUpdate', function (data) {
        console.log('rankUpdate data:', data);
        // var ul = document.querySelector('#rank ul');
        // var area = app.getCurArea();
        // var li = "";
        // // data.entities.forEach(function(id) {
        // //     var e = area.getEntity(id);
        // //     if (e) {
        // //         li += '<li><span>' + e.name + '</span><span>' + e.score + '</span></li>';
        // //     }
        // // });
        // ul.innerHTML = li;
    });

    //handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function(reason) {
        showLogin();
    });

    // Handle user leave message, occours when players leave the area
    pomelo.on('onPlayerLeave', function (data) {
        // var area = app.getCurArea();
        // var playerId = data.playerId;
        // console.log('onUserLeave invoke!');
        // area.removePlayer(playerId);
    });


};