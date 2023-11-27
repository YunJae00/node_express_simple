var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var bodyPaser = require('body-parser');
var bkfd2Password = require('pbkdf2-password');
var hasher = bkfd2Password();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var app = express();
app.use(bodyPaser.urlencoded({extended: false}));
app.use(session({
    secret: 'sdfsdf#$',
    resave: false,
    saveUninitialized: true,
    //store: new FileStore()
}));
app.use(passport.initialize());
app.use(passport.session());
app.get('/count', function(req, res){
    if(req.session.count){
        req.session.count++;
    }
    else{
        req.session.count = 1;
    }
    res.send('count : '+req.session.count);
});
app.get('/auth/logout', function(req, res){
    req.logout(function(err) {
        if (err) {
            console.error(err);
        }
    });
    req.session.save(function(){
        res.redirect('/welcome');
    })
});
app.get('/welcome', function(req, res){
    if(req.user && req.user.displayName){
        res.send(`
            <h1>Hello, ${req.user.displayName}</h1>
            <a href="/auth/logout">Logout</a>
        `);
    }
    else{
        res.send(`
            <h1>Welcome</h1>
            <ul>
                <li><a href="/auth/login">Login</a></li>
                <li><a href="/auth/register">Register</a></li>
            </ul>
        `);
    }
});
passport.serializeUser(function(user, done){
    done(null, user.authId);
});
passport.deserializeUser(function(id, done){
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.authId === id){
            return done(null, user);
        }
    }
    done('there is no user.');
});
passport.use(new LocalStrategy(
    function(username, password, done){
        var uname = username;
        var pwd = password;
        for(var i=0; i<users.length; i++){
            var user = users[i];
            if(uname===user.username){
                return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
                    if(hash === user.password){
                        done(null, user);
                    } else {
                        done(null, false);
                    }
                });
            }
        }
        done(null, false);
    }
));
passport.use(new FacebookStrategy({
    clientID: '1589518671851073',
    clientSecret: '7edc4127ab5b9c1ef548f0d8500d74cf',
    callbackURL: "/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    var authId = 'facebook:'+profile.id;
    for(var i=0; i<users.length; i++){
        var user = users[i];
        if(user.authId === authId){
            return done(null, user);
        }
    }
    var newuser = {
        'authId': authId,
        'displayName': profile.displayName,
        'email': profile.emails[0].value
    }
    users.push(newuser);
    done(null, newuser);
  }
));
app.post(
    '/auth/login',
    passport.authenticate(
        'local',
        {
            successRedirect: '/welcome',
            failureRedirect: '/auth/login',
            failureFlash: false
        }
    )
);
app.get(
    '/auth/facebook',
    passport.authenticate(
        'facebook',
        {scope:'email'}
    )
);
app.get(
    '/auth/facebook/callback',
    passport.authenticate(
        'facebook', 
        { 
            failureRedirect: '/auth/login' 
        }),
    function(req, res) {
        req.session.save(function(){
            res.redirect('/welcome');
        })
    }
);
var users =[
    {
        authId:'local:egoing',
        username:'egoing',
        password: 'epPgcmcZAm27i6Yqqg/yiDTy+IrB9pYe5N0Hd5iLCyAGaHdjG5vyGeNa9qt0PGP8/pKvrwntfMkWmE4FDTyNqaxraJrXaURS8LVmnUn4rv0GC3shEfA1Qhqmb/gTQDuY2v/AMDkm6/j9ImRfUxlnDPkPKuuOkSf756Spj78ooxU=',
        salt: '7mz/CIqWByzztmIHPPy1NuzFbAUYNKLhGzGkWgs3fREdLDWeoblyNiMgZM2bAs5is0vgW+rwALmtkmy6z/h4pg==',
        displayName:'Egoing'
    }
];
app.post('/auth/register', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
        var user = {
            authId: 'local:'+req.body.username,
            username: req.body.username,
            password: hash,
            salt: salt,
            displayName: req.body.displayName
        };
        users.push(user);
        req.login(user, function(err){
            req.session.save(function(){
                res.redirect('/welcome');
            });
        });
    });
});
app.get('/auth/register', function(req, res){
    var output=`
        <h1>Register</h1>
        <form action="/auth/register" method="post">
            <p>
                <input type="text" name="username" placeholder="username">
            </p>
            <p>
                <input type="password" name="password" placeholder="password">
            </p>
            <p>
                <input type="text" name="displayName" placeholder="displayName">
            </p>
            <p>
                <input type="submit">
            </p>
    </form>
    `;
    res.send(output);
});
app.get('/auth/login', function(req, res){
    var output = `
    <h1>Login</h1>
    <form action="/auth/login" method="post">
        <p>
            <input type="text" name="username" placeholder="username">
        </p>
        <p>
            <input type="password" name="password" placeholder="password">
        </p>
        <p>
            <input type="submit">
        </p>
    </form>
    <a href="/auth/facebook">facebook</a>
    `;
    res.send(output);
});
app.listen(3003, function(){
    console.log('connectex 3003 port');
});