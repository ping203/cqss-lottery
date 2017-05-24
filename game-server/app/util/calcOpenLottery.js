/**
 * Created by linyng on 17-5-23.
 */

function CalcOpenLottery() {
}

CalcOpenLottery.prototype.init = function () {
    this.totalSizeResult = null;
    this.totalSingleDoubleResult = null;
    this.dragonAndTigerResult = null;
    this.equal15Result = null;
    this.perPosSizeSingleDoubleResult = new Set();
    this.perPosValueResult = new Set();
    this.containValueResult = new Set();
    this.pantherResult = new Set();
    this.shunZiResult = new Set();
    this.openCodeResult = new Set();
}

// 和大小计算 大>=23  小<23
CalcOpenLottery.prototype.totalSizeCalc = function (numbers) {

    var total = 0;
    for (var i = 0; i<numbers.length;++i){
        total += parseInt(numbers[i],10);
    }

    this.totalSizeResult = total >= 23 ? '大':'小';
    this.openCodeResult.add(total >= 23 ? '大':'小');

};

// 和单双计算
CalcOpenLottery.prototype.totalSingleDoubleCalc = function (numbers) {
    var total = 0;
    for (var i = 0; i<numbers.length;++i){
        total += parseInt(numbers[i],10);
    }

    this.totalSingleDoubleResult = total%2 === 0 ? '双':'单';
    this.openCodeResult.add(total%2 === 0 ? '双':'单');
};

// 龙虎计算 龙 1>5 虎 1<5
CalcOpenLottery.prototype.dragonAndTigerCalc = function (numbers) {
    var number1 = numbers[0];
    var number5 = numbers[4];

    if(number1 === number5){
        return;
    }

    this.dragonAndTigerResult = number1 > number5 ? '龙':'虎';
    this.openCodeResult.add(number1 > number5 ? '龙':'虎');
};

// 合玩法 1=5
CalcOpenLottery.prototype.equal15Calc = function (numbers) {
    var number1 = numbers[0];
    var number5 = numbers[4];
    if(number1 === number5){
        this.equal15Result = '合';
        this.openCodeResult.add('合');
    }
};

//球大小单双 0-4 小 5-9 大
CalcOpenLottery.prototype.perPosSizeSingleDoubleCalc = function (numbers) {
    for (var i = 0; i<numbers.length;++i){
        var num = parseInt(numbers[i],10);
        var size = num <=4 ? ((i+1)+'小'):((i+1)+'大');
        this.perPosSizeSingleDoubleResult.add(size);

        var sd = num%2 === 0?((i+1)+'双'):((i+1)+'单');
        this.perPosSizeSingleDoubleResult.add(sd);

        this.openCodeResult.add(size);
        this.openCodeResult.add(sd);
    }
};

//球值
CalcOpenLottery.prototype.perPosValueCalc = function (numbers) {
    for (var i = 0; i<numbers.length;++i){
        var vals = (i+1)+numbers[i];
        this.perPosValueResult.add(vals);
        this.openCodeResult.add(vals);
    }
};

//包数字
CalcOpenLottery.prototype.containValueCalc = function (numbers) {
    for (var i = 0; i<numbers.length;++i){
        var vals = (i+1)+numbers[i];
        this.containValueResult.add(vals);
        this.openCodeResult.add(vals);
    }
};

//豹子、顺子 豹子：连续3球相同 顺子：连子
CalcOpenLottery.prototype.pantherCalc = function (numbers) {
    if(numbers[0] === numbers[1] === numbers[2]){
        this.pantherResult.add('前豹');
        this.openCodeResult.add('前豹');
    }else if(numbers[1] === numbers[2] === numbers[3]){
        this.pantherResult.add('中豹');
        this.openCodeResult.add('中豹');
    }else if(numbers[2] === numbers[3] === numbers[4]){
        this.pantherResult.add('后豹');
        this.openCodeResult.add('后豹');
    }
};

CalcOpenLottery.prototype.checkShunZi = function (numbers) {
   var sortNumbers =  numbers.sort(function (a, b) {
        return a-b;
    });

   var index = 0;
   var isShunZi = true;
    do {
        if(sortNumbers[index]+ 1 != sortNumbers[index+1]){
            isShunZi =false;
            break;
        }
        index++;
    }while (index < 3);

    return isShunZi;
}

CalcOpenLottery.prototype.shunZiCalc = function (numbers) {
    if(this.checkShunZi([numbers[0],numbers[1],numbers[2]])){
        this.shunZiResult.add('前顺');
        this.openCodeResult.add('前顺');
    }else if(this.checkShunZi([numbers[1],numbers[2],numbers[3]])){
        this.shunZiResult.add('中顺');
        this.openCodeResult.add('中顺');
    }else if(this.checkShunZi([numbers[2],numbers[3],numbers[4]])){
        this.shunZiResult.add('后顺');
        this.openCodeResult.add('后顺');
    }
};

CalcOpenLottery.prototype.calc = function (numbers) {
    this.init();
    this.totalSizeCalc(numbers);
    this.totalSingleDoubleCalc(numbers);
    this.dragonAndTigerCalc(numbers);
    this.equal15Calc(numbers);
    this.perPosSizeSingleDoubleCalc(numbers);
    this.perPosValueCalc(numbers);
    this.containValueCalc(numbers);
    this.pantherCalc(numbers);
    this.shunZiCalc(numbers);

    var r =  {
        totalSizeResult:this.totalSizeResult,
        totalSingleDoubleResult:this.totalSingleDoubleResult,
        dragonAndTigerResult:this.dragonAndTigerResult,
        equal15Result:this.equal15Result,
        perPosSizeSingleDoubleResult:this.perPosSizeSingleDoubleResult,
        perPosValueResult:this.perPosValueResult,
        containValueResult:this.containValueResult,
        pantherResult:this.pantherResult,
        shunZiResult:this.shunZiResult
    };

    return r;
}

module.exports ={
    id:"calcOpenLottery",
    func:CalcOpenLottery,
    props:[
        {name:'consts', ref:'consts'}
    ]
}