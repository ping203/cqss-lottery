var bearcat = require('bearcat');
var pomelo = require('pomelo');

/**
 * Init app for client.
 */
var app = pomelo.createApp();

var Configure = function () {
    app.set('name', 'lottery');

    app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');

    // configure for global
    app.configure('production|development', function () {
        "use strict";
        let dbclient = require('./app/dao/mysql/mysql').init(app);
        app.set('dbclient', dbclient);
        //app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient}});

        //Set areasIdMap, a map from area id to serverId.
        // if (app.serverType !== 'master') {
        //     var areas = app.get('servers').area;
        //     var areaIdMap = {};
        //     for(var id in areas){
        //         areaIdMap[areas[id].area] = areas[id].id;
        //     }
        //     app.set('areaIdMap', areaIdMap);
        // }
    });

    // configure for gate
    app.configure('production|development', 'gate', function () {
        app.set('connectorConfig', {
            connector: pomelo.connectors.hybridconnector
        });
    });

    // configure for connector
    app.configure('production|development', 'connector', function () {
        app.set('connectorConfig', {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 100
        });
    });

    // Configure for auth server
    app.configure('production|development', 'auth', function() {
        // load session congfigures
        app.set('session', require('./config/session.json'));
    });

    app.configure('production|development', 'area', function () {
        let areaId = app.get('curServer').areaId;
        if (!areaId || areaId < 0) {
            throw new Error('load area config failed');
        }

        var areaService = bearcat.getBean('areaService');
         areaService.init();
        // app.set("areaService", areaService)
    });

    // Configure for chat server
    app.configure('production|development', 'chat', function() {
        var chatService = bearcat.getBean('chatService');
        chatService.init();
 //       console.log(chatService);
       // app.set('chatService', chatService);

    });
}

var contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath]);

bearcat.start(function () {
    Configure();
    app.set('bearcat', bearcat);
    // start app
    app.start();
});

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});