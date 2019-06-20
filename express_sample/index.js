var crypto = require('crypto')
var express = require('express');

var app = express();


app.get('/', function (req, res) {
    var salt = crypto.randomBytes(128).toString('base64')
    var hash = crypto.pbkdf2Sync('crypto', salt, 10000, 64, 'sha512').toString('hex')
    res.send(hash);
});

app.get('/mem', function (req, res) {
    var tmpData = Buffer.alloc(1024 * 1024 * 1500, 0);
    res.send("Use 1.5G Me");
});


app.listen(3001, function () {
    console.log('Example app listening on port 3001!');
});
