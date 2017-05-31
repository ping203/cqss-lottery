## lottery
A simple chat room experiment using pomelo framework and html5.
The chat server currently runs on nodejs v0.8, and should run fine on the latest stable as well.It requires the following npm libraries:
- pomelo
- express
- crc
- koa2
- cqss

serverId           serverType pid   rss(M) heapTotal(M) heapUsed(M) uptime(m) 
area-server-1      area       12485 72.59  35.53        32.07       85.34     
auth-server-1      auth       12490 60.77  32.03        27.89       85.34     
chat-server-1      chat       12496 61.14  32.03        28.25       85.34     
connector-server-1 connector  12479 77.14  38.53        35.73       85.34     
gate-server-1      gate       12474 60.35  33.03        29.60       85.34     
master-server-1    master     12464 61.11  32.03        28.85       85.35     
rank-server-1      rank       12503 62.27  30.03        27.00       85.34     

#工作日志

## 2017-06-07
* 托管用户投注管理
* 投注没能正常开奖处理
* 投注后，用户退出在登录，操作投注id问题
* 充值记录
* 用户中奖提示
* 分析排序问题
* 聊天用户信息显示（昵称、头像、等级、金币、胜率[胜数，胜率]）
