module.exports = function(app){
    var conn = require('./db')();
    var bkfd2Password = require('pbkdf2-password');
    var passport = require('passport');
    var LocalStrategy = require('passport-local').Strategy;
    var FacebookStrategy = require('passport-facebook').Strategy;
    var hasher = bkfd2Password();
    app.use(passport.initialize());
    app.use(passport.session());
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
    var users =[
        {
            authId:'local:egoing',
            username:'egoing',
            password: 'epPgcmcZAm27i6Yqqg/yiDTy+IrB9pYe5N0Hd5iLCyAGaHdjG5vyGeNa9qt0PGP8/pKvrwntfMkWmE4FDTyNqaxraJrXaURS8LVmnUn4rv0GC3shEfA1Qhqmb/gTQDuY2v/AMDkm6/j9ImRfUxlnDPkPKuuOkSf756Spj78ooxU=',
            salt: '7mz/CIqWByzztmIHPPy1NuzFbAUYNKLhGzGkWgs3fREdLDWeoblyNiMgZM2bAs5is0vgW+rwALmtkmy6z/h4pg==',
            displayName:'Egoing'
        }
    ];
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
        var sql = 'SELECT * FROM users WHERE authID=?';
        conn.query(sql, [authID], function(err, results){
            if(results.length>0){
                done(null, results[0]);
            }
            else{
                var newuser = {
                    'authId': authId,
                    'displayName': profile.displayName,
                    'email': profile.emails[0].value
                };
                var sql = 'INSERT INTO users SET ?';
                conn.query(sql, newuser, function(err, results){
                    if(err){
                        console.log(err);
                        done('Error');
                    }
                    else {
                        done(null, newuser);
                    }
                });
            }
        });
    }
    ));
    return passport;
}