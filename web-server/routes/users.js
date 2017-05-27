"use strict";

const router = require('koa-router')()
const Token = require('../../shared/token');
const secret = require('../../shared/config/session').secret;
const daoUser = require('../lib/dao/daoUser');
const code = require('../../shared/code');
var async = require('async');

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

/**
 * user login
 *
 * @param  {String}   username or phone
 * @param  {String}   pwd
 *
 */

router.post('/login', function (ctx, next) {
    let msg = ctx.request.body;
    let loginType = 0;
    if (!!msg.phone) {
        loginType = 1;
    }
    if (!(loginType == 0 ? msg.username : msg.phone) || !msg.password) {
        ctx.body = code.PARAMERROR;
        return;
    }

    return new Promise((resove, reject) => {
        if (loginType == 0) {
            daoUser.getUserByName(msg.username, function (err, user) {
                if (err || !user) {
                    console.log('username not exist!');
                    ctx.body = code.USER.FA_USER_LOGIN_ERROR;
                }
                else if (msg.password !== user.password) {
                    console.log('password incorrect!');
                    ctx.body = code.USER.FA_USER_LOGIN_ERROR;
                }
                else {
                    console.log(msg.username + ' login!');
                    ctx.body = {code: code.OK.code, token: Token.create(user.id, Date.now(), secret), uid: user.id};
                }
                resove();
            });
        }
        else {
            daoUser.getUserByPhone(msg.phone, function (err, user) {
                if (err || !user) {
                    console.log('phone not exist!');
                    ctx.body = code.USER.FA_USER_LOGIN_ERROR;
                }
                else if (msg.password !== user.password) {
                    console.log('password incorrect!');
                    ctx.body = code.USER.FA_USER_LOGIN_ERROR;
                }
                else {
                    console.log(msg.phone + ' login!');
                    ctx.body = {code: code.OK.code, token: Token.create(user.id, Date.now(), secret), uid: user.id};
                }
                resove();
            });
        }

    });

});

/**
 * check user is aready exist
 *
 * @param  {String}   username
 */
router.post('/checkUser', function (ctx, next) {
    let msg = ctx.request.body;
    if (!msg.username) {
        ctx.body = code.PARAMERROR;
        return;
    }

    return new Promise((resolve, reject) => {
        daoUser.getUserByName(msg.username, function (err, user) {
            if (err) {
                ctx.body = code.DBFAIL;
            }
            else {
                if (user) {
                    ctx.body = code.USER.FA_USER_AREADY_EXIST;
                }
                else {
                    ctx.body = code.OK;
                }
            }
            resolve();
        });
    });
});

/**
 * check phone has be used.
 *
 * @param  {String}   phone
 */
router.post('/checkPhone', function (ctx, next) {
    let msg = ctx.request.body;
    if (!msg.phone) {
        ctx.body = code.PARAMERROR;
        return;
    }

    return new Promise((resolve, reject) => {
        daoUser.getUserByPhone(msg.phone, function (err, user) {
            if (err) {
                ctx.body = code.DBFAIL;
            }
            else {
                if (user) {
                    ctx.body = code.USER.FA_PHONE_AREADY_EXIST;
                }
                else {
                    ctx.body = code.OK;
                }
            }
            resolve();
        });
    });
});

router.post('/register', function (ctx, next) {
    //console.log('req.params');
    let msg = ctx.request.body;
    let from = ctx.request.ip;
    from = from.replace('::ffff:','');
    if (!msg.username || !msg.password || !msg.phone || !msg.inviter) {
        ctx.body = code.PARAMERROR;
        return;
    }

    return new Promise((resolve, reject) => {

        async.waterfall([
            function (cb) {
                daoUser.getUserByName(msg.username, cb);
            },function (user, cb) {
                if(user){
                    cb(code.USER.FA_USER_AREADY_EXIST)
                }
                else {
                    daoUser.getUserByPhone(msg.phone, cb);
                }
            },
            function (user, cb) {
                if(user){
                    cb(code.USER.FA_PHONE_AREADY_EXIST)
                }
                else {
                    //todo: cancle invitor limite
                   // daoUser.getUserByName(msg.inviter, cb);
                    cb(null, {name:'ok'});
                }
            },function (inviter, cb) {
                if(inviter){
                    cb(null, null);
                }else {
                    cb(code.USER.FA_INVITOR_NOT_EXIST);
                }
            }
        ], function (err) {
            if(err){
                ctx.body = err;
                resolve();
            }else {
                daoUser.createUser(msg.username, msg.password, msg.phone, msg.inviter, from, function (err, uid) {
                    if (err) {
                        console.error(err);
                        ctx.body = code.DBFAIL;
                    } else {
                        console.log('A new user was created! --' + msg.name);
                        ctx.body = {
                            code: code.OK.code
                        };
                    }
                    resolve();
                });
            }
        });
    });

});

module.exports = router
