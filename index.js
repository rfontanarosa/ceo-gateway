var express = require('express');
var request = require('request');
var urljoin = require('url-join');

var config = require('./config');

var app = express();

app.get('/login', function (req, res) {
  request.post({
    url: urljoin(config.ceo.url, '/login'),
    form: {
      email: config.ceo.username,
      password: config.ceo.password,
    }
  }, function(error, response, body) {
    request.get({
      headers: {
        Cookie: response.headers['set-cookie'],
      },
      url: urljoin(config.ceo.url, 'account', config.ceo.institutionId),
      followRedirect: false
    }, function(error, response1, body) {
      console.log(response1.statusCode);
    });
  });
  res.send(200);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
