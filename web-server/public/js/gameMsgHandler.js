/**
 * Created by linyng on 17-5-17.
 */

var pomelo = window.pomelo;

function gameMsgInit() {
    // add entities
    pomelo.on('addEntities', function(data) {

    });

    //Handle remove entities message
    pomelo.on('removeEntities', function(data) {

    });

    // Handle move  message
    pomelo.on('onMove', function(data) {

    });

    // Handle remove item message
    pomelo.on('onRemoveItem', function(data) {

    });

    // Handle pick item message
    pomelo.on('onPickItem', function(data) {

    });

    pomelo.on('rankUpdate', function(data) {
        var ul = document.querySelector('#rank ul');
        var area = app.getCurArea();
        var li = "";
        // data.entities.forEach(function(id) {
        //     var e = area.getEntity(id);
        //     if (e) {
        //         li += '<li><span>' + e.name + '</span><span>' + e.score + '</span></li>';
        //     }
        // });
        ul.innerHTML = li;
    });

    // Handle kick out messge, occours when the current player is kicked out
    pomelo.on('onKick', function() {
        console.log('You have been kicked offline for the same account logined in other place.');
    });

    // Handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function(reason) {

    });

    // Handle user leave message, occours when players leave the area
    pomelo.on('onPlayerLeave', function(data) {
        // var area = app.getCurArea();
        // var playerId = data.playerId;
        // console.log('onUserLeave invoke!');
        // area.removePlayer(playerId);
    });

    pomelo.on('onPlayerBet', function (data) {

    })
};