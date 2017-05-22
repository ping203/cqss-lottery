// var util = require('util');
//
// var a = function() {
// 	this.test();
// }
//
// a.prototype.test = function() {
// 	console.log('test');
// }
//
// var b = function() {
// 	a.call(this);
// 	// this.init();
// }
//
// util.inherits(b, a);
//
// b.prototype.init = function() {
// 	console.log('init');
// }
//
// // b.call(null);
// // var aa = new a();
// // aa.test();
//
// var bb = new b();
// console.log(bb instanceof a);
// bb.init();
// console.log(a);
// console.log(b);

// var reg1 = /^大(\d+)小(\d+)/ig;



var map = {
    A:'大',
    B:'小',
    C:'单',
    D:'双',
    E:'龙',
    F:'虎'

};

//1）和大小玩法 5位数字相加大于等于23为大，反之为小
console.log('------总和大小-------');
var reg11 = /^大(\d+)/i;
var reg12 = /小(\d+)/i;

var type11 = '大100';
var type12 = '小100';
console.log(vals1[0].match(reg11));
console.log('--------------------');

//2）和单双玩法 5位数字相加为奇数及为单 偶数为双
console.log('------总和单双-------');
var reg21 = /单(\d+)/i;
var reg22 = /双(\d+)/i;
var reg23 = /^单(\d+)双(\d+)/i;
var type21 = '单100';
var type22 = '双100';
console.log(type21.match(reg21));
console.log('--------------------');

//3） 龙虎玩法 1球比5球大为龙,反之为虎
console.log('------龙虎玩法-------');
var reg31 = /龙(\d+)/i;
var reg32 = /虎(\d+)/i;
var type31 = '龙100';
var type32 = '虎100';
console.log(type31.match(reg31));
console.log('--------------------');

//4） 和/合 的玩法 及 一球和五球数字相同为和或合 例如50985 一球和五球都为5 识别方式（和100或者合100）
console.log('------和/合玩法-------');
var reg41 = /和(\d+)/i;
var reg42 = /合(\d+)/i;
var type41 = '和100';
var type42 = '合100';
console.log(type41.match(reg41));
console.log('--------------------');

//可以组合：大单龙和60：大 单 龙 和 各60

//5） 数字玩法 例如1球买8, 100元 识别方式（1/8/100）
// 类推3球买5 ,50元 识别方式（3/5/50）例如4球买6,8各50
// 即 4球买6 ,50元 4球买8 ,50元 识别方式（4/68/50）类推5球买789各60
// 识别方式（5/789/60）如果玩家买1，2，3球7各100元  识别方式（123/7/100）
// 。如果玩家买3，4球买数字6 和8各100元 识别方式（34/68/100 一共投注4注 投注金400元）
// 以此类推 混合买法 124/大单579/90 代表 1，2，4球买 大 单 各90元
// 买 数字5 7 9 各90元  此注一共15注  投注额 1350元