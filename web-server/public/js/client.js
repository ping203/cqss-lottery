$(document).ready(function () {
    //when first time into chat room.
    showLogin();

    $('#login').on('click', login);
    $('#joinRoom').on('click', joinRoom);
    $('#joinGame').on('click', joinGame);
    $('#registe').on('click', register);
    $('#setRoleName').on('click', setRoleName);
    $('#bet').on('click', bet);
    $('#unBet').on('click', unBet);
    $('#myIncome').on('click', myIncome);
    $('#myBets').on('click', myBets);
    $('#friendIncome').on('click', friendIncome);
    $('#winRateRankList').on('click', winRateRankList);
    $('#todayRichRankList').on('click', todayRichRankList);


    $('#adminLogin').on('click', adminLogin);
    $('#recharge').on('click', recharge);
    $('#cash').on('click', cash);
    $('#setConfig').on('click', setConfig);

    var adminClient = new window.adminClient();

    function adminLogin() {
        adminClient.login('sys', '', function (err, result) {
            if (!!err) {
                console.log('管理员登录失败,', err);
                return;
            }
            console.log('管理员登录成功');
        })
    }

    function recharge() {
        adminClient.recharge(3, 10000, function (err, result) {
            if (!!err) {
                console.log('充值失败');
                return;
            }
            console.log('充值成功');
        })
    }

    function cash() {
        adminClient.cash(3, 5000, function (err, result) {
            if (!!err) {
                console.log('提现失败');
                return;
            }
            console.log('充值成功');
        })
    }

    function setConfig() {
        adminClient.setConfig({
            "bw": [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5],
            "msg": "三季娱乐，技术封测",
            "norm": {"bz": {"m": 6000, "p": 600000}, "sz": {"m": 2000, "p": 200000}, "num": {"m": 3000, "p": 100000}, "sum": {"m": 2000, "p": 200000}, "size": {"m": 3000, "p": 100000}},
            "odds": {"bz": {"max": 90, "min": 60}, "sz": {"max": 20, "min": 10}, "num": {"max": 10, "min": 9}, "sum": {"max": 10, "min": 9}, "size": {"max": 2, "min": 1}},
            "rank": ["英勇青铜", "不屈白银", "荣耀黄金", "华贵铂金", "璀璨钻石", "最强王者", "武林高手", "绝世奇才", "威震三界", "盖世英雄"],
            "limit": 5,
            "initial": 30000}, function (err, result) {
            if (!!err) {
                console.log('提现失败');
                return;
            }
            console.log('充值成功');
        })
    }


    gameMsgInit();

    //deal with chat mode.
    $("#entry").keypress(function (e) {
        var route = "chat.chatHandler.sendChatMsg";
        var target = $("#usersList").val();
        if (e.keyCode != 13 /* Return */) return;
        var msg = $("#entry").attr("value").replace("\n", "");
        if (!util.isBlank(msg)) {
            pomelo.request(route, {
                from: playerInfo.roleName,
                target: target,
                msgType: CHATMSGTYPE.CHARACTERS,
                content: msg,
            }, function (data) {
                $("#entry").attr("value", ""); // clear the entry field.
                if (target != '*' && target != username) {
                    addMessage(username, target, msg);
                    $("#chatHistory").show();
                }
            });
        }
    });


    /**
     * join room
     */

    function joinRoom(callback) {
        rid = Number($('#roomList').val());
        pomelo.request("chat.chatHandler.enterRoom", {
            roomId: rid,
        }, function (res) {

            if (res.result.code != 200) {
                callback('Enter room fail');
                return;
            }
            callback(null);
            initUserList(res.data);
        });
    }

    function joinGame() {
        joinRoom(function (err) {
            if (err) {
                console.log(err);
                return;
            }
            pomelo.request("area.playerHandler.enterGame", null, function (res) {
                if (res.result.code != 200) {
                    alert('进入游戏失败');
                    return;
                }

                console.log(res.data.player);
                playerInfo = res.data.player;
                players.entityId = res.data.player;

                var str = JSON.stringify(playerInfo);
                console.log(str);
                $('#playerInfo').html(str);

                setName();
                setRoom();
                showChat();
            });

        });
    }

    function setRoleName() {
        var newRoleName = $('#roleName').val();
        pomelo.request("area.playerHandler.setRoleName", {roleName: newRoleName}, function (res) {
            if (res.result.code != 200) {
                alert('修改名称失败');
                return;
            }
            alert('修改名称成功');
        });
    }

    function bet(e) {
        var betValue = $('#betValue').val();
        pomelo.request("area.playerHandler.bet", {betData: betValue}, function (res) {
            if (res.result.code != 200) {
                console.log('投注失败', res.result.desc);
                return;
            }
            alert('投注成功');
        });
    }


    function unBet(e) {
        var entityId = $('#betValue').val();
        pomelo.request("area.playerHandler.unBet", {entityId: entityId}, function (res) {
            if (res.result.code != 200) {
                console.log('撤销投注失败');
                return;
            }
            alert('撤销投注成功');
        });
    }

    function myIncome(e) {
        pomelo.request("area.playerHandler.myIncome", {skip: 10, limit: 10}, function (res) {
            if (res.result.code != 200) {
                console.log('獲取收益失敗');
                return;
            }
            console.log(res);
            alert('獲取收益成功');
        });
    }

    function myBets(e) {
        pomelo.request("area.playerHandler.myBets", {skip: 10, limit: 10}, function (res) {
            if (res.result.code != 200) {
                console.log('獲取收益失敗');
                return;
            }
            console.log(res);
            alert('獲取收益成功');
        });
    }

    function friendIncome(e) {
        pomelo.request("area.playerHandler.friendIncome", {skip: 10, limit: 10}, function (res) {
            if (res.result.code != 200) {
                console.log('獲取朋友收益失敗');
                return;
            }
            console.log(res);
            alert('獲取朋友收益成功');
        });
    }

    function winRateRankList(e) {
        pomelo.request("rank.rankHandler.winRateRankList", {skip: 10, limit: 10}, function (res) {
            if (res.result.code != 200) {
                console.log('獲取朋友收益失敗');
                return;
            }
            console.log(res);
            alert('獲取朋友收益成功');
        });
    }

    function todayRichRankList(e) {
        pomelo.request("rank.rankHandler.todayRichRankList", {skip: 10, limit: 10}, function (res) {
            if (res.result.code != 200) {
                console.log('獲取朋友收益失敗');
                return;
            }
            console.log(res);
            alert('獲取朋友收益成功');
        });
    }

    /**
     * login
     */
    function login() {
        username = $('#loginUser').val().trim();
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

        //  function sendPostRequest(ServerLink,str,callback,errcall) {
        //      var sendstr=JSON.stringify(str);
        //      var xhr = new XMLHttpRequest();
        //      xhr.open("POST", ServerLink);
        //      //xhr.open("GET", ServerLink+link+"?"+parm,false);
        // //     xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded; charset=UTF-8');
        //      xhr.setRequestHeader('Content-Type','application/json; charset=UTF-8');
        //     // xhr.setRequestHeader("Charset","uft-8");
        //      xhr.send(sendstr);
        //      xhr.onreadystatechange = function () {
        //          if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
        //              var result = JSON.parse(xhr.responseText);
        //              if(result["act"]=="erro") {
        //                 // errcall(result["msg"]);
        //                  return;
        //              }
        //             // callback(result);
        //          }
        //      };
        //  }
        //
        //  sendPostRequest(httpHost + 'users/login', {username: username, password: pwd});
        //
        // return;

        $.post(httpHost + 'users/login', {username: username, password: pwd}, function (res) {
            if (res.code === 501) {
                alert('Username or password is invalid!');
                return;
            }
            if (res.code !== 200) {
                alert('Username is not exists!');
                return;
            }

            //query entry of connection
            queryEntry(res.uid, function (host, port) {
                pomelo.init({
                    host: host,
                    port: port,
                    log: true
                }, function () {
                    var route = "connector.entryHandler.login";
                    pomelo.request(route, {token: res.token}, function (res) {
                        if (res.result.code != 200) {
                            alert('进入游戏失败');
                            return;
                        }

                        console.log(res.data);
                        playerInfo = res.data;

                        var str = JSON.stringify(playerInfo);
                        console.log(str);
                        $('#playerInfo').html(str);

                        rolename = playerInfo.roleName;

                        var route = "chat.chatHandler.getRooms";
                        pomelo.request(route, null, function (res) {
                            if (res.result.code != 200) {
                                showError(DUPLICATE_ERROR);
                                return;
                            }

                            var roomIdList = [];
                            for (var key in res.data) {
                                console.log(key);
                                roomIdList.push(key);
                            }

                            addRoomList(roomIdList);

                            joinRoom(function (err) {
                                if (err) {
                                    console.log(err);
                                    return;
                                }

                                setName();
                                setRoom();
                                showChat();
                            });

                        });
                    });
                });
            });
        });
    }

    //register
    function register() {
        var name = $('#reg-name').val().trim();
        var phone = $('#reg-phone').val().trim();
        var inviter = $('#reg-inviter').val().trim();
        var pwd = $('#reg-pwd').val().trim();

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

        console.log(httpHost + 'users/register');
        $.post(httpHost + 'users/register', {
            username: name,
            password: pwd,
            phone: phone,
            inviter: inviter
        }, function (data) {
            if (data.code === 200) {
                alert('registe ok！');
                console.log(data);
            } else {
                alert('registe fail！');
                console.log(data);
            }
        });
    }
});