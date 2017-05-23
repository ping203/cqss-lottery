/**
 * Created by linyng on 17-5-23.
 */

function CalcOpenLottery() {
}

// TotalSize:1, //和大小 (大100)  (小100)
//     TotalSingleDouble:2, //和单双 (单100  双100)
//     DragonAndTiger:3, //龙虎 (龙100 虎100)
//     Equal15:4, //合/和玩法 (和100 合100)  （大单龙和60）
//     PerPosSizeSingleDouble:5, //每个位置大小单双 (1／大双／100)
//     PerPosValue:6, //每个位置值 (124/579/90)  组合(124/大单579/90)
//     ContainValue:7, //包数字 （75/100） （8/100）
//     ShunZiPanther:8 //豹子、数字玩法 （豹100）代表前中后豹子各买100 （豹/100/50/80） 代表前豹子 100元 中豹子50 元 后豹子 80元 （豹顺100） 代表前中后顺子和豹子各买100元 一共下注6注 投注金600元
// this.splitReg=/.{1}/g;
// this.reg1 = /([大小单双龙虎和合]+)(\d+)/i;
// this.reg2 = /(\d+)\/(.+)\/(\d+)/i; //每位数字的大小单双值玩法
// this.reg3 = /(\d+)\/(\d+)/i; //包数字玩法
// this.reg4 = /([豹顺]+)(\d+)/i;
// this.reg5= /([豹顺]+)\/(\d+)\/(\d+)\/(\d+)/i;
// this.keyValue =['前','中','后'];

CalcOpenLottery.prototype.init = function () {
    this.totalSizeResult = null;
    this.totalSingleDoubleResult = null;
    this.dragonAndTigerResult = null;
    this.equal15Result = null;
}

// 和大小计算 大>=23  小<23
CalcOpenLottery.prototype.totalSizeCalc = function (numbers) {

    var total = 0;
    for (var i = 0; i<numbers.length;++i){
        total += parseInt(numbers[i],10);
    }

    this.totalSizeResult = total >= 23 ? '大':'小';

};

// 和单双计算
CalcOpenLottery.prototype.totalSingleDoubleCalc = function (numbers) {
    var total = 0;
    for (var i = 0; i<numbers.length;++i){
        total += parseInt(numbers[i],10);
    }

    this.totalSingleDoubleResult = total%2 === 0 ? '双':'单';
};

// 龙虎计算 龙 1>5 虎 1<5
CalcOpenLottery.prototype.dragonAndTigerCalc = function (numbers) {
    var number1 = numbers[0];
    var number5 = numbers[4];

    if(number1 === number5){
        return;
    }

    this.dragonAndTigerResult = number1 > number5 ? '龙':'虎';
};

// 合玩法 1=5
CalcOpenLottery.prototype.equal15Calc = function (numbers) {
    var number1 = numbers[0];
    var number5 = numbers[4];
    if(number1 === number5){
        this.equal15Result = '合';
    }
};

//球大小单双 0-4 小 5-9 大
CalcOpenLottery.prototype.perPosSizeSingleDoubleCalc = function (numbers) {

};

//球值
CalcOpenLottery.prototype.perPosValueCalc = function (numbers) {

};

//包数字
CalcOpenLottery.prototype.containValueCalc = function (numbers) {

};

//豹子、顺子 豹子：连续3球相同 顺子：连子
CalcOpenLottery.prototype.shunZiPantherCalc = function (numbers) {

};

CalcOpenLottery.prototype.calc = function (numbers) {
    this.init();
}

module.exports ={
    id:"calcOpenLottery",
    func:CalcOpenLottery,
    props:[
        {name:'consts', ref:'consts'}
    ]
}