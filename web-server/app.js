const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const static = require('koa-static');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser')();
const logger = require('koa-logger');
const cors = require('koa-cors');
const path = require('path');

const mysql = require('./lib/dao/mysql/mysql');
const daoUser = require('./lib/dao/daoUser');

const index = require('./routes/index');
const users = require('./routes/users');

// var mount_uploadify = require('koa-uploadify')
//
// mount_uploadify(app,{
//     path:'/upload',
//     fileKey:'myfile',
//     multer:{ dest: 'uploads/' },
//     callback:function(req){
//         console.log('-----------------',req.files);
//         return req.files
//     }
// });


// error handler
onerror(app);

// middlewares
//跨域访问
//app.use(cors());
app.use(logger());
app.use(bodyparser);
app.use(json());

app.use(static(path.join(__dirname, '/public')));

app.use(views(path.join(__dirname , '/views'), {
  extension: 'ejs'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

//Init mysql
mysql.init();

module.exports = app;
