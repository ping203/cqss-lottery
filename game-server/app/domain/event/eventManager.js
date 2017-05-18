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
			//addSaveEvent(entity);
			break;
		case this.consts.EntityType.NPC :
			this.npcEvent.addEventForNPC(entity);
			break;
	}
};

/**
 * Add save event for player
 * @param {Object} player The player to add save event for.
 */
function addSaveEvent(player) {
	var app = pomelo.app;
	player.on('save', function() {
		app.get('sync').exec('playerSync.updatePlayer', player.id, player.strip());
	});

	player.bet.on('save', function () {
        app.get('sync').exec('betSync.updateBet', player.bet.id, player.bet);
    });

    player.bet.on('save', function () {
        app.get('sync').exec('taskSync.updateTask', player.task.id, player.task);
    })
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

