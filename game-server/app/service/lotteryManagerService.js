/**
 * Created by linyng on 17-5-17.
 */

var logger = require('pomelo-logger').getLogger('bearcat-lottery', 'lotteryManagerService');
var bearcat = require('bearcat');
var http = require('http');
var equal = require('assert').equal;
var async = require('async');

// 非常荣幸您选择我们作为您的开奖数据供应商！
// 您的数据账号：33C9381371DE3848
//
// 您的校验密码：ED10513DF478
//
// 快速管理地址：http://face.opencai.net?token=33c9381371de3848&verify=ed10513df478
//
//     自助管理平台：(即将上线)

function LotteryManagerService() {
    this.addrIndex = 0;
    this.latestLotteryInfo = null;
}

var lotteryResultSample = {
    "rows": 1,
    "code": "cqssc",
    "remain": "498hrs",
    "next": [{"expect": "20170518025", "opentime": "2017-05-18 10:10:40"}],
    "open": [{"expect": "20170518024", "opencode": "3,7,2,1,1", "opentime": "2017-05-18 10:00:52"}],
    "time": "2017-05-18 10:01:31"
};

LotteryManagerService.prototype.init = function (service) {
    this.lotteryData = this.dataApiUtil.lotteryApi().data;
    this.lotteryIds = this.dataApiUtil.lotteryApi().ids;
    this.areaService = service;

    setInterval(this.tick.bind(this), 2000);
};

LotteryManagerService.prototype.nextAddr = function () {
    if(this.lotteryIds.length <=0) return null;

    this.addrIndex = (this.addrIndex + 1) % this.lotteryIds.length;
    var addr = this.lotteryData[this.addrIndex];
    var retVal = {header:{host:addr.host, port:addr.port,path:addr.path,method:addr.method},type:addr.type};
    return retVal;
};

LotteryManagerService.prototype.tick = function () {

    var self = this;
    this.getLotteryInfo(this.nextAddr(), function (err, result) {
        if(err || !result){
            return;
        }

        var lottery = self.areaService.getLottery();
        if(!lottery){
            return;
        }

        if(!self.latestLotteryInfo || (!!self.latestLotteryInfo && self.latestLotteryInfo.next.period != result.last.period)){
            lottery.publishLottery(result);
            self.areaService.openLottery(result.last.numbers.split(','), result.last.period, result.last.opentime);
        }

        //   logger.info('result__________________',result);
        var sysTickTime = new Date(result.tickTime);
        var nextOpenTime = new Date(result.next.opentime);

        var tick = (nextOpenTime - sysTickTime)/1000;
        lottery.setTickCount(result.next.period, tick);

        self.latestLotteryInfo = result;
     //   logger.info(this.latestLotteryInfo);

        // 使用结果
        //self.areaService.addAction();
    });
};

LotteryManagerService.prototype.checkA = function(result){
    var lotteryInfo ={};
    if(!result.code || !result.time){
        return null;
    }

    lotteryInfo.identify = result.code;
    lotteryInfo.tickTime = result.time;

    if(!result.next || !result.next[0] || !result.next[0].expect || !result.next[0].opentime){
        return null;
    }
    lotteryInfo.next = {period:result.next[0].expect, opentime:result.next[0].opentime};
    if(!result.open || !result.open[0] || !result.open[0].expect || !result.open[0].opentime || !result.open[0].opencode){
        return null;
    }
    lotteryInfo.last = {period:result.open[0].expect, opentime:result.open[0].opentime, numbers:result.open[0].opencode};

    return lotteryInfo;
};

LotteryManagerService.prototype.checkB = function(result){

};

LotteryManagerService.prototype.checkC = function(result){

};

LotteryManagerService.prototype.parse = function (type, result) {
    var resultInfo = null;
    switch (type){
        case this.consts.LotteryType.A:
            resultInfo = this.checkA(result);
            break;
        case this.consts.LotteryType.B:
            break;
        case this.consts.LotteryType.C:
            break;
        default:
            break;
    }
    return resultInfo;
}

LotteryManagerService.prototype.getLotteryInfo = function (options, callback) {

    if(!options){
        callback('Request err', null);
        return;
    }

    var self = this;

    var req = http.request(options.header, function (res) {
        if(res.statusCode != 200){
            self.getLotteryInfo(this.nextAddr(), callback);
            return;
        }

        var resData = "";
        res.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            if(chunk){
                resData += chunk;
            }
        });

        res.on("end", function () {

             console.log('BODY: ' + resData);
            var jsData = JSON.parse(resData);
            if(!jsData){
                self.getLotteryInfo(self.nextAddr(), callback);
                return;
            }

            var parseResult = self.parse(options.type, jsData)
            if(parseResult){
                callback(null, parseResult);
            }
            else {
                self.getLotteryInfo(self.nextAddr(), callback);
            }
        });
    });

    req.on('error', function (e) {
        console.log('problem with request: ' + e.message);
        self.getLotteryInfo(self.nextAddr(), callback);
    });

    req.end();
};

module.exports = {
    id: "lotteryManagerService",
    func: LotteryManagerService,
    props: [
        {name: "dataApiUtil", ref: "dataApiUtil"},
        {name: "consts", ref: "consts"}
    ]
}
