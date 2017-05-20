/**
 * Created by linyng on 17-5-16.
 */

$(document).ready(function () {

});


var adminClient = function () {
    this.host = window.location.hostname;
    this.port = 3014;
    this.httpHost = location.href.replace(location.hash, '').substr(0, httpHost.lastIndexOf('/') + 1);
};

adminClient.prototype.invokeCallback = function (cb) {
    if (!!cb && typeof cb == 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

//登录游戏服务器
adminClient.prototype.login = function (username, password, cb) {
    if (!username) {
        this.invokeCallback(cb, '用户名不能为空', null);
        return;
    }

    if (!password) {
        this.invokeCallback(cb, '密码不能为空', null);
        return;
    }

    var self = this;
    $.post(this.httpHost + 'admin/login', {username: username, password: password}, function (res) {
        if (res.code !== 200) {
            this.invokeCallback(cb, '用户名或者密码错误', null);
            return;
        }
        pomelo.init({
            host: this.host,
            port: 3014,
            log: true
        }, function () {
            pomelo.request('gate.gateHandler.connect', {
                uid: uid
            }, function (res) {
                pomelo.disconnect();
                if (res.result.code !== 200) {
                    this.invokeCallback(cb, '连接游戏网关失败', null);
                    return;
                }

                pomelo.init({
                    host: res.data.host,
                    port: res.data.port,
                    log: true
                }, function () {
                    pomelo.request('connector.entryHandler.adminLogin', {token: res.token}, function (res) {
                        if (res.result.code != 200) {
                            this.invokeCallback(cb, '登录游戏服务器失败', null);
                            return;
                        }
                        this.invokeCallback(cb, null, '登录游戏服务器成功');
                    });
                });
            });
        });
    });
};

// 充值
adminClient.prototype.recharge = function (uid, money, cb) {
    pomelo.request('connector.entryHandler.recharge', {uid: uid, money: money}, function (res) {
        if (!res.result || res.result.code != 200) {
            this.invokeCallback(cb, res.result,null);
        }
        else {
            this.invokeCallback(cb, null,null);
        }
    });
};

// 兑现
adminClient.prototype.cash = function (uid, money, cb) {
    pomelo.request('connector.entryHandler.cash', {uid: uid, money: money}, function (res) {
        if (!res.result || res.result.code != 200) {
            this.invokeCallback(cb, res.result);
        }
        else {
            this.invokeCallback(cb, null);
        }
    });
};

adminClient.prototype.setConfig = function (configs,cb) {
    pomelo.request('connector.entryHandler.setConfig', {configs: configs}, function (res) {
        if (!res.result || res.result.code != 200) {
            this.invokeCallback(cb, res.result);
        }
        else {
            this.invokeCallback(cb, null);
        }
    });
};

window.adminClient = adminClient;

