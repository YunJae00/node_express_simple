var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser('1213asdfasd#$@#'));

var products={
    1:{title:'the history of web 1'},
    2:{title:'the next web'}
};
app.get('/products', function(req, res){
    var output = '';
    for(var name in products){
        output += `
            <li>
                <a href="/cart/${name}">${products[name].title}</a>
            </li>`
    }
    res.send(`<h1>Products</h1><ul>${output}</ul><a href="/cart">Cart</a>`);
})
app.get('/cart/:id', function(req, res){
    var id = req.params.id;
    if(req.signedCookies.cart){
        var cart = req.signedCookies.cart;
    } else {
        var cart ={};
    }
    if(!cart[id]){
        cart[id] = 0;
    }
    cart[id] = parseInt(cart[id])+1;
    res.cookie('cart', cart, {signed:true});
    res.redirect('/cart');
})
app.get('/cart', function(req, res){
    var cart = req.signedCookies.cart;
    if(!cart){
        res.send('Empty');
    } else{
        var output ='';
        for(var id in cart){
            output += `<li>${products[id].title} (${cart[id]})</li>`;
        }
    }
    res.send(`
        <h1>Cart</h1>
        <ul>${output}</ul>
        <ul>${output}</ul><a>Poducts list</a>
    `);
})
app.get('/count', function(req, res){
    if(req.signedCookies.count){
        var count = parseInt(req.signedCookies.count);
    } else {
        var count = 0;
    }
    count +=1;
    res.cookie('count', count, {signed:true});
    res.send('count : ')+ req.cookies.count;
});
app.listen(3003, function(){
    console.log('connectex 3003 port');
});