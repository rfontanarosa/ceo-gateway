var express = require('express');
var request = require('request');
var urljoin = require('url-join');

var config = require('./config');

var app = express();

app.use(express.json());

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

app.post('/create-project', function (req, res) {

  const buff = req.body.plots.reduce((acc, curr, i) => {
    return `${acc}\n${curr.lon},${curr.lat},${i+1}`;
  }, 'LON,LAT,PLOTID');

  const formData = {
    institution: config.ceo.institutionId,
    'privacy-level': 'private',
    'lon-min': '',
    'lon-max': '',
    'lat-min': '',
    'lat-max': '',
    'base-map-source': 'DigitalGlobeRecentImagery',
    'plot-distribution': 'csv',
    'num-plots': '',
    'plot-spacing': '',
    'plot-shape': 'square',
    'plot-size:': req.body.plotSize,
    'sample-distribution': 'gridded',
    'samples-per-plot': '1',
    'sample-resolution': '',
    'sample-values': '[{"id":1,"question":"CLASS","answers":[{"id":1,"answer":"FOREST","color":"#00ff00"},{"id":2,"answer":"WATER","color":"#0000ff"}, {"id":3,"answer":"OTHER","color":"#ffff"}],"parentQuestion":-1,"parentAnswer":-1,"dataType":"text","componentType":"button"}]',
    'survey-rules': '',
    'project-template': '0',
    'use-template-plots': '',
    name: req.body.title,
    description: req.body.title,
    'plot-distribution-csv-file': {
      value: Buffer(buff),
      options: {
        filename:'buff.csv'
      }
    },
  };

  request.post({
    url: urljoin(config.ceo.url, 'create-project'),
    formData: formData
  }, function(error, response, body) {
    console.log(response.statusCode);
  });

  res.send(200);

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
