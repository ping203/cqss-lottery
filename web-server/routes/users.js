"use strict";

const router = require('koa-router')()
const Token = require('../../shared/token');
const secret = require('../../shared/config/session').secret;
var daoUser = require('../lib/dao/daoUser');

router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})


// router.get('/auth_success', function(ctx, next) {
//     if (ctx.req.session.userId) {
//         var token = Token.create(req.session.userId, Date.now(), secret);
//         await ctx.render('auth', {code: 200, token: token, uid: req.session.userId});
//     } else {
//         ctx.res.render('auth', {code: 500});
//     }
// });

router.post('/login', function(ctx, next) {
    let msg = ctx.request.body;
    let username = msg.username;
    let pwd = msg.password;
    if (!username || !pwd) {
        ctx.res.body = {code: 500};
        return;
    }

    return new Promise((resove, reject)=>{
        daoUser.getUserByName(username, function(err, user) {
            if (err || !user) {
                console.log('username not exist!');
                ctx.body = {code: 500};
            }
            else if (pwd !== user.password) {
                // TODO code
                // password is wrong
                console.log('password incorrect!');
                ctx.body = {code: 501};
            }
            else {
                console.log(username + ' login!');
                ctx.body = {code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id};
            }
            resove();
        });
    });

});

router.post('/register', function(ctx, next) {
    //console.log('req.params');
    let msg = ctx.request.body;
    if (!msg.name || !msg.password) {
        ctx.body = {code: 500};
        return;
    }

    return new Promise((resolve, reject)=>{
        daoUser.getUserByName(msg.name, function (err, user) {
            if(!err){ //todo test !err ,should modify if(err)
                ctx.body = {code: 500, err:err};
                resolve();
            }
            else {
                daoUser.createUser(msg.name, msg.password, msg.phone, msg.inviteId, ctx.request.ip, function(err, user) {
                    if (err || !user) {
                        console.error(err);
                        if (err && err.code === 1062) {
                            ctx.body = {code: 501};
                        } else {
                            ctx.body = {code: 500};
                        }
                    } else {
                        console.log('A new user was created! --' + msg.name);
                        ctx.body = {code: 200, token: Token.create(user.id, Date.now(), secret), uid: user.id};
                    }
                    resolve();
                });
            }
        });


    });

});

module.exports = router
