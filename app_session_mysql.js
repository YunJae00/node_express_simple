var express = require('express');
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyPaser = require('body-parser');
var app = express();
app.use(bodyPaser.urlencoded({extended: false}));
app.use(session({
    secret: 'sdfsdf#$',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'rnjsdbswo00!',
        database: 'o2'
    })
}));
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
    delete req.session.displayName;
    req.session.save(function(){
        res.redirect('/welcome');
    })
})
app.get('/welcome', function(req, res){
    if(req.session.displayName){
        res.send(`
            <h1>Hello, ${req.session.displayName}</h1>
            <a href="/auth/logout">Logout</a>
        `);
    }
    else{
        res.send(`
            <h1>Welcome</h1>
            <a href="/auth/login">Login</a>
        `);
    }
});
app.post('/auth/login', function(req, res){
    var user = {
        username:'egoing',
        password: '111',
        displayName:'Egoing'
    };
    var uname = req.body.username;
    var pwd = req.body.password;
    if(uname===user.username && pwd===user.password){
        req.session.displayName = user.displayName;
        req.session.save(function(){
            res.redirect('/welcome');
        })
    }
    else{
        res.send('who are you');
    }
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
    `;
    res.send(output);
})
app.listen(3003, function(){
    console.log('connectex 3003 port');
})