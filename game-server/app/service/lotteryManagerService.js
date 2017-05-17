/**
 * Created by linyng on 17-5-17.
 */

var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'lotteryManagerService');
var bearcat = require('bearcat');
var http = require('http');
var equal = require('assert').equal;

// 非常荣幸您选择我们作为您的开奖数据供应商！
// 您的数据账号：33C9381371DE3848
//
// 您的校验密码：ED10513DF478
//
// 快速管理地址：http://face.opencai.net?token=33c9381371de3848&verify=ed10513df478
//
//     自助管理平台：(即将上线)

function LotteryManagerService() {
    this.host = 'a.apiplus.net';
    this.path = '/newly.do?token=33c9381371de3848&code=cqssc&rows=1&format=json&extend=true';

    this.options = {
        host: this.host,
        port: 80,
        path: this.path,
        method: 'GET',
    };
}

LotteryManagerService.prototype.getLotteryInfo = function (callback) {
    var req = http.request(this.options, function (res) {
        console.log('STATUS: ' + res.statusCode);
        equal(200, res.statusCode);
        console.log('HEADERS: ' + JSON.stringify(res.headers));
        var resData;
        res.on('data',function (chunk) {
            console.log('BODY: ' + chunk);
            resData+=chunk;
        });

        res.on("end", function() {
            var jsData = JSON.parse(resData);
            callback(null,JSON.parse(resData));
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });


    req.end();
};

module.exports = {
    id:"lotteryManagerService",
    func:LotteryManagerService
}
