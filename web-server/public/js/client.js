var pomelo = window.pomelo;
var username;
var rolename;
var users;
var rid;
var base = 1500;
var increase = 25;
var reg = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
var LOGIN_ERROR = "There is no server to log in, please wait.";
var LENGTH_ERROR = "Name/Channel is too long or too short. 20 character max.";
var NAME_ERROR = "Bad character in Name/Channel. Can only have letters, numbers, Chinese characters, and '_'";
var DUPLICATE_ERROR = "Please change your name to login.";
var CHATMSGTYPE = {
    CHARACTERS:0,
	IMAGE:1,
	AUDIO:2
}

var httpHost = location.href.replace(location.hash, '');
httpHost = httpHost.substr(0, httpHost.lastIndexOf('/')+1);

util = {
	urlRE: /https?:\/\/([-\w\.]+)+(:\d+)?(\/([^\s]*(\?\S+)?)?)?/g,
	//  html sanitizer
	toStaticHTML: function(inputHtml) {
		inputHtml = inputHtml.toString();
		return inputHtml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},
	//pads n with zeros on the left,
	//digits is minimum length of output
	//zeroPad(3, 5); returns "005"
	//zeroPad(2, 500); returns "500"
	zeroPad: function(digits, n) {
		n = n.toString();
		while(n.length < digits)
		n = '0' + n;
		return n;
	},
	//it is almost 8 o'clock PM here
	//timeString(new Date); returns "19:49"
	timeString: function(date) {
		var minutes = date.getMinutes().toString();
		var hours = date.getHours().toString();
		return this.zeroPad(2, hours) + ":" + this.zeroPad(2, minutes);
	},

	//does the argument only contain whitespace?
	isBlank: function(text) {
		var blank = /^\s*$/;
		return(text.match(blank) !== null);
	}
};

//always view the most recent message when it is added
function scrollDown(base) {
	window.scrollTo(0, base);
	$("#entry").focus();
};

// add message on board
function addMessage(from, target, text, time) {
	var name = (target == '*' ? 'all' : target);
	if(text === null) return;
	if(time == null) {
		// if the time is null or undefined, use the current time.
		time = new Date();
	} else if((time instanceof Date) === false) {
		// if it's a timestamp, interpret it
		time = new Date(time);
	}
	//every message you see is actually a table with 3 cols:
	//  the time,
	//  the person who caused the event,
	//  and the content
	var messageElement = $(document.createElement("table"));
	messageElement.addClass("message");
	// sanitize
	text = util.toStaticHTML(text);
	var content = '<tr>' + '  <td class="date">' + util.timeString(time) + '</td>' + '  <td class="nick">' + util.toStaticHTML(from) + ' says to ' + name + ': ' + '</td>' + '  <td class="msg-text">' + text + '</td>' + '</tr>';
	messageElement.html(content);
	//the log is the stream that we view
	$("#chatHistory").append(messageElement);
	base += increase;
	scrollDown(base);
};

// show tip
function tip(type, name) {
	var tip,title;
	switch(type){
		case 'online':
			tip = name + ' is online now.';
			title = 'Online Notify';
			break;
		case 'offline':
			tip = name + ' is offline now.';
			title = 'Offline Notify';
			break;
		case 'message':
			tip = name + ' is saying now.'
			title = 'Message Notify';
			break;
	}
	var pop=new Pop(title, tip);
};

// init user list
function initUserList(users) {
    for (var key in users){
        var slElement = $(document.createElement("option"));
        slElement.attr("value", users[key].uid);
        slElement.text(users[key].name);
        $("#usersList").append(slElement);
    }
};

// add user in user list
function addUser(user) {
	var slElement = $(document.createElement("option"));
	slElement.attr("value", user.userId);
	slElement.text(user.roleName);
	$("#usersList").append(slElement);
};

// add room in room list
function addRoomList(rooms) {
    rooms.forEach(function (val) {
        var slElement = $(document.createElement("option"));
        slElement.attr("value", val);
        slElement.text(val);
        $("#roomList").append(slElement);
    })
};

// remove user from user list
function removeUser(user) {
	$("#usersList option").each(
		function() {
			if($(this).val() === user) $(this).remove();
	});
};

// set your name
function setName() {
	$("#name").text(username);
};

// set your room
function setRoom() {
	$("#room").text(rid);
};

// show error
function showError(content) {
	$("#loginError").text(content);
	$("#loginError").show();
};

// show login panel
function showLogin() {
	$("#loginView").show();
	$("#chatHistory").hide();
	$("#toolbar").hide();
	$("#loginError").hide();
	$("#loginUser").focus();
};

// show chat panel
function showChat() {
	$("#loginView").hide();
	$("#loginError").hide();
	$("#toolbar").show();
	$("entry").focus();
	scrollDown(base);
};

// show game panel
function showGame() {
    $("#loginView").hide();
    $("#loginError").hide();
    $("#toolbar").hide();
    // $("entry").focus();
    scrollDown(base);
};

// query connector
function queryEntry(uid, callback) {
	var route = 'gate.gateHandler.connect';
	pomelo.init({
		host: window.location.hostname,
		port: 3014,
		log: true
	}, function() {
		pomelo.request(route, {
			uid: uid
		}, function(res) {
			pomelo.disconnect();
			if(res.result.code === 500) {
				showError(LOGIN_ERROR);
				return;
			}
			callback(res.data.host, res.data.port);
		});
	});
};

$(document).ready(function() {
	//when first time into chat room.
	showLogin();

	$('#login').on('click', login);
	$('#joinRoom').on('click', joinRoom);
	$('#joinGame').on('click', joinGame);
	$('#registe').on('click', register);

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

     gameMsgInit();

	//handle disconect message, occours when the client is disconnect with servers
	pomelo.on('disconnect', function(reason) {
		showLogin();
	});

	//deal with chat mode.
	$("#entry").keypress(function(e) {
		var route = "chat.chatHandler.sendChatMsg";
		var target = $("#usersList").val();
		if(e.keyCode != 13 /* Return */ ) return;
		var msg = $("#entry").attr("value").replace("\n", "");
		if(!util.isBlank(msg)) {
			pomelo.request(route, {
				from: rolename,
				target: target,
				msgType:CHATMSGTYPE.CHARACTERS,
                content: msg,
			}, function(data) {
				$("#entry").attr("value", ""); // clear the entry field.
				if(target != '*' && target != username) {
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

            if(res.result.code != 200){
            	callback('Enter room fail');
            	return;
			}
			callback(null);
            initUserList(res.data);
        });
    }

    function joinGame() {
        joinRoom(function (err) {
			if(err){
				console.log(err);
				return;
			}
            pomelo.request("area.playerHandler.enterGame", null, function (res) {
                if(res.result.code != 200){
                	alert('进入游戏失败');
					return;
                }

                console.log(res.data.player);

                setName();
                setRoom();
                showChat();
            });

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

        $.post(httpHost + 'users/login', {username: username, password: pwd}, function(res) {
            if (res.code === 501) {
                alert('Username or password is invalid!');
                return;
            }
            if (res.code !== 200) {
                alert('Username is not exists!');
                return;
            }

            //query entry of connection
            queryEntry(res.uid, function(host, port) {
                pomelo.init({
                    host: host,
                    port: port,
                    log: true
                }, function() {
                    var route = "connector.entryHandler.login";
                    pomelo.request(route, {token: res.token}, function(res) {
                        if(res.result.code != 200) {
                            showError(DUPLICATE_ERROR);
                            return;
                        }

						var userData = res.data.user;
                        var playerData = res.data.player;
                        rolename = playerData.roleName;
                        console.log(userData);
                        console.log(playerData);

                        var route = "chat.chatHandler.getRooms";
                        pomelo.request(route, null, function(res) {
                            if(res.result.code != 200) {
                                showError(DUPLICATE_ERROR);
                                return;
                            }

                            var roomIdList = [];
                            for (var key in res.data){
                                console.log(key);
                                roomIdList.push(key);
                            }

                            addRoomList(roomIdList);
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
        $.post(httpHost + 'users/register', {username: name, password: pwd,phone:phone,inviter:inviter}, function(data) {
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