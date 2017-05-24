var bearcat = require('bearcat');
var pomelo = require('pomelo');
var sync = require('pomelo-sync-plugin');
var RouteUtil = require('./app/util/routeUtil');

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
        app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient,interval:500}});

        app.route('area', RouteUtil.area);
        app.route('chat', RouteUtil.chat);
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
        app.filter(pomelo.filters.serial());
        app.before(bearcat.getBean('playerFilter'));

        app.areaService = bearcat.getBean('areaService');
        app.areaService.init();
    });

    // Configure for chat server
    app.configure('production|development', 'chat', function() {
        app.chatService = bearcat.getBean('chatService');
        app.chatService.init();
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