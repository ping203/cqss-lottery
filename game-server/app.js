// const heapdump = require('heapdump');
const bearcat = require('bearcat');
const pomelo = require('pomelo');
const sync = require('pomelo-sync-plugin');
const RouteUtil = require('./app/util/routeUtil');
const globalChannel = require('pomelo-globalchannel-plugin');
const status = require('pomelo-status-plugin');
const logger = require('pomelo-logger').getLogger(__filename);

// Cannot enqueue Query after fatal error
/**
 * Init app for client.
 */
const app = pomelo.createApp();

const Configure = function () {
    app.set('name', 'lottery');

    app.loadConfig('mysql', app.getBase() + '/../shared/config/mysql.json');

    // configure for global
    app.configure('production|development', function () {
        "use strict";
        let dbclient = require('./app/dao/mysql/mysql').init(app);
        app.set('dbclient', dbclient);
        app.use(sync, {sync: {path:__dirname + '/app/dao/mapping', dbclient: dbclient,interval:500}});

        app.use(globalChannel, {globalChannel: {
            prefix: 'globalChannel',
            host: '127.0.0.1',
            port: 6379,
            cleanOnStartUp: true
        }});

        app.use(status, {status: {
            prefix: 'status',
            host: '127.0.0.1',
            port: 6379,
            cleanOnStartUp: true
        }});


        app.enable('systemMonitor');

        // proxy configures
        app.set('proxyConfig', {
            cacheMsg: true,
            interval: 30,
            lazyConnection: true
            // enableRpcLog: true
        });

        // remote configures
        app.set('remoteConfig', {
            cacheMsg: true,
            interval: 30
        });


        app.before(pomelo.filters.toobusy()); // 服务器繁忙


        // filter configures
        // app.filter(pomelo.filters.serial()); //主要负责保证所有从客户端到服务端的请求能够按顺序地处理
        // app.filter(pomelo.filters.time()); //主要负责记录请求的相应时间
        // app.filter(pomelo.filters.timeout()); //主要负责监控请求响应时间，如果超时就给出警告

        // route configures
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
            heartbeat : 30,
            useDict : true,
            useProtobuf : true
        });
    });

    // Configure for auth server
    app.configure('production|development', 'auth', function() {
        // load session congfigures
        app.set('session', require('./config/session.json'));
    });

    app.configure('production|development', 'game', function () {
        app.filter(pomelo.filters.serial());
        app.before(bearcat.getBean('playerFilter'));

        app.gameService = bearcat.getBean('gameService');
        app.gameService.init();
    });

    // Configure for chat server
    app.configure('production|development', 'chat', function() {
        app.chatService = bearcat.getBean('chatService');
        app.chatService.init();
    });

    // Configure for rank server
    app.configure('production|development', 'rank', function() {
        app.rankService = bearcat.getBean('rankService');
        app.rankService.init();
    });

    app.configure('production|development', 'manager', function(){
        var events = pomelo.events;
        app.instanceManager = bearcat.getBean('instanceManager');
        app.event.on(events.ADD_SERVERS, app.instanceManager.addServers);
        app.event.on(events.REMOVE_SERVERS, app.instanceManager.removeServers);
    });

}

const contextPath = require.resolve('./context.json');
bearcat.createApp([contextPath]);

bearcat.start(function () {
    Configure();
    app.set('bearcat', bearcat);
    // start app
    app.start();
});

process.on('uncaughtException', function (err) {
    logger.error(' Caught exception: ', err.stack);
});

// app.set('errorHandler', function(err, msg, resp, session, cb) {
//     logger.error(' Caught error: ' , err, msg);
// });