__resources__["/clientManager.js"] = {
	meta: { mimetype: "application/javascript" },

	data: function(exports, require, module, __filename, __dirname) {
        var pomelo = window.pomelo;
        var config = require('config');
        var app = require('app');
        var dataApi = require('dataApi');
        var msgHandler = require('msgHandler');
		var EntityType = require('consts').EntityType;
        var loading = false;
        var httpHost = location.href.replace(location.hash, '');
        httpHost = httpHost.substr(0, httpHost.lastIndexOf('/')+1);

		function init() {
            //bind events
            $('#loginBtn').on('click', login);
            $('#registerBtn').on('click', register);
        }

        function move(targetPos) {
          pomelo.request('area.playerHandler.move', {targetPos: targetPos}, function(result) {
            if (result.code == 200) {
              // var sprite = app.getCurPlayer().getSprite();
              // var sPos = result.sPos;
                        // sprite.translateTo(sPos.x, sPos.y);
            } else {
              console.warn('curPlayer move error!');
            }
          });
        }

        function pick(args) {
          var targetId = args.id;
          var entity = app.getCurArea().getEntity(targetId);

          if (entity.type === EntityType.TREASURE) {
            pomelo.request('area.playerHandler.move', {targetPos: {x: entity.x, y: entity.y}, target: targetId});
          }
        }

        /**
         * login
         */
        function login() {

            var username = $('#loginUser').val().trim();
            var pwd = $('#loginPwd').val().trim();
            $('#loginPwd').val('');
            if (!username) {
                alert("Username is required!");
                return;
            }

            if (!pwd) {
                alert("Password is required!");
                return;
            }

            $.post(httpHost + 'users/login', {username: username, password: pwd}, function(data) {
                if (data.code === 501) {
                    alert('Username or password is invalid!');
                    return;
                }
                if (data.code !== 200) {
                    alert('Username is not exists!');
                    return;
                }

                authEntry(data.uid, data.token, function() {
                    loading = false;
                });
                localStorage.setItem('username', username);
            });
        }

        function queryEntry(uid, callback) {
            pomelo.init({host: config.GATE_HOST, port: config.GATE_PORT, log: true}, function() {
                pomelo.request('gate.gateHandler.queryEntry', { uid: uid}, function(data) {
                    pomelo.disconnect();

                    if(data.code === 2001) {
                        alert('Servers error!');
                        return;
                    }

                    callback(data.host, data.port);
                });
            });
        }

        /**
         * enter game server
         * route: connector.entryHandler.entry
         * response：
         * {
     *   code: [Number],
     *   player: [Object]
     * }
         */
        function entry(host, port, token, callback) {
            // init socketClient
            // TODO for development
            if(host === '127.0.0.1') {
                host = config.GATE_HOST;
            }
            pomelo.init({host: host, port: port, log: true}, function() {
                pomelo.request('connector.entryHandler.entry', {token: token}, function(data) {
                    console.log(data);

                    if (callback) {
                        callback(data.code);
                    }

                    if (data.code == 1001) {
                        alert('Login fail!');
                        return;
                    } else if (data.code == 1003) {
                        alert('Username not exists!');
                        return;
                    }

                    if (data.code != 200) {
                        alert('Login Fail!');
                        return;
                    }

                    // init handler
                    // loginMsgHandler.init();
                    //gameMsgHandler.init();

                    msgHandler.init();

                    afterLogin(data);

                });
            });
        }

        function authEntry(uid, token, callback) {
            queryEntry(uid, function(host, port) {
                entry(host, port, token, callback);
            });
        }

        pomelo.authEntry = authEntry;

        //register
        function register() {
            if (loading) {
                return;
            }
            loading = true;
            var name = $('#reg-name').val().trim();
            var phone = $('#reg-phone').val().trim();
            var inviteCode = $('#reg-inviteCode').val().trim();
            var pwd = $('#reg-pwd').val().trim();
            var cpwd = $('#reg-cpwd').val().trim();
            $('#reg-pwd').val('');
            $('#reg-cpwd').val('');
            if (name === '') {
                alert('Username is required!');
                loading = false;
                return;
            }
            if (pwd === '') {
                alert('Password is required!');
                loading = false;
                return;
            }
            if (pwd != cpwd) {
                alert('Entered passwords differ!');
                loading = false;
                return;
            }

            console.log(httpHost + 'users/register');
            $.post(httpHost + 'users/register', {name: name, password: pwd,phone:phone,inviteId:inviteCode}, function(data) {
                if (data.code === 501) {
                    alert('Username already exists！');
                } else if (data.code === 200) {
                    alert('Register ok！');
                } else {
                    alert('Register fail！');
                    loading = false;
                }
            });
        }

        function afterLogin(data) {
            var userData = data.response.user;
            var playerData = data.response.player;

            pomelo.request("chat.chatHandler.getRooms", null, function (data) {
                console.log('chat.chatHandler.getRooms' + data);

                pomelo.request("chat.chatHandler.enterRoom", {
                    roomId: 10001,
                }, function (data) {
                    console.log('chat.chatHandler.enterRoom' + data);
                });
            });

            pomelo.request("area.playerHandler.enterScene", {
                            name: name,
                            playerId: data.playerId
                        }, function (data) {

                        });
        }

        // createPlayer
        function createPlayer() {
            if (loading) {
                return;
            }

            var roleName = "";
            var sex = 0;

            pomelo.request("connector.roleHandler.createPlayer", {roleName: roleName, sex: sex}, function(data) {
                loading = false;
                if (data.code == 500) {
                    alert("The name already exists!");
                    return;
                }

                if (data.player.id <= 0) {
                    switchManager.selectView("loginPanel");
                } else {
                    afterLogin(data);
                }
            });

        }


        // function entry(name, callback) {
        //     pomelo.init({host: config.GATE_HOST, port: config.GATE_PORT, log: true}, function () {
        //         pomelo.request('gate.gateHandler.queryEntry', {uid: name}, function (data) {
        //             pomelo.disconnect();
        //
        //             if (data.code === 2001) {
        //                 alert('server error!');
        //                 return;
        //             }
        //             if (data.host === '127.0.0.1') {
        //                 data.host = location.hostname;
        //             }
        //             // console.log(data);
        //             pomelo.init({host: data.host, port: data.port, log: true}, function () {
        //                 if (callback) {
        //                     callback();
        //                 }
        //             });
        //         });
        //     });
        // }
        //
        // var uiInit = function () {
        //     var btn = document.querySelector('#login .btn');
        //     btn.onclick = function () {
        //         var name = document.querySelector('#login input').value;
        //         entry(name, function () {
        //             loadAnimation(function () {
        //                 pomelo.request('connector.entryHandler.entry', {name: name}, function (data) {
        //                     pomelo.request("area.playerHandler.enterScene", {
        //                         name: name,
        //                         playerId: data.playerId
        //                     }, function (data) {
        //                         msgHandler.init();
        //                         app.init(data.data);
        //                     });
        //                 });
        //             });
        //         });
        //     };
        // };
        //
        // var jsonLoad = false;
        // var loadAnimation = function (callback) {
        //     if (jsonLoad) {
        //         if (callback) {
        //             callback();
        //         }
        //         return;
        //     }
        //     pomelo.request('area.playerHandler.getAnimation', function (result) {
        //         dataApi.animation.set(result.data);
        //         jsonLoad = true;
        //         if (callback) {
        //             callback();
        //         }
        //     });
        // };

        exports.init = init;
        exports.move = move;
        exports.pick = pick;
  }
};



