var pomelo = require('pomelo');

var EventManager = function () {

};

/**
 * Listen event for entity
 */
EventManager.prototype.addEvent = function(entity){
	switch(entity.type){
		case this.consts.EntityType.PLAYER :
			this.playerEvent.addEventForPlayer(entity);
			addPlayerSaveEvent(entity);
			break;
		case this.consts.EntityType.LOTTERY :
			this.npcEvent.addEventForNPC(entity);
            addLotterySaveEvent(entity);
			break;
	}
};

/**
 * Add save event for player
 * @param {Object} player The player to add save event for.
 */
function addPlayerSaveEvent(player) {
	var app = pomelo.app;
	player.on('save', function() {
		app.get('sync').exec('playerSync.updatePlayer', player.id, player.strip());
	});

    player.bets.on('save', function () {
        app.get('sync').exec('betSync.updateBet', player.bet.id, player.bet);
    });
    //
    // player.task.on('save', function () {
    //     app.get('sync').exec('taskSync.updateTask', player.task.id, player.task);
    // })
}

function addLotterySaveEvent(lottery) {
    var app = pomelo.app;
    lottery.on('save', function() {
        app.get('sync').exec('lotterySync.updateLottery', player.id, player.strip());
    });
}

module.exports ={
	id:"eventManager",
	func:EventManager,
    props: [
    	{name: "consts", ref: "consts"},
		{name:"playerEvent", ref:"playerEvent"},
		{name:"npcEvent", ref:"npcEvent"}
	]
}

