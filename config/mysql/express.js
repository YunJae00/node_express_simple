module.exports = function () {
    var express = require('express');
    var session = require('express-session');
    var MySQLStore = require('express-mysql-session')(session);
    var bodyPaser = require('body-parser');

    var app = express();
    app.set('views', './views/mysql');
    app.set('view engine', 'jade');
    app.use(bodyPaser.urlencoded({ extended: false }));
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
    return app;
}