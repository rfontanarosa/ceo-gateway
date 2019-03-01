var express = require('express');
var request = require('request');

var config = require('./config');

var app = express();

app.get('/', function (req, res) {
  request.post({
    url: config.ceo.url + '/login',
    form: {
      email: config.ceo.username,
      password: config.ceo.password,
    }
  }, function(error, response, body) {
    request.get({
      headers: {
        Cookie: response.headers['set-cookie'],
      },
      url: config.ceo.url + '/account/1',
      followRedirect: false
    }, function(error, response1, body) {
      console.log(response1.statusCode);
    });
  });
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
