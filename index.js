var express = require('express');
var request = require('request');
var urljoin = require('url-join');
var randomColor = require('randomcolor');
var geolib = require('geolib');

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

  const plots = req.body.plots.reduce((acc, curr, i) => {
    return `${acc}\n${curr.lon},${curr.lat},${i+1}`;
  }, 'LON,LAT,PLOTID');

  const bounds = geolib.getBounds(req.body.plots);

  const colors = randomColor({
    count: req.body.classes.length,
    hue: 'random'
  });

  const sampleValues = [{
    id: 1,
    question: "CLASS",
    answers: req.body.classes.map(function(currentValue, index) {
      return {
        id: index + 1,
        answer: currentValue,
        color: colors[index]
      }
    }),
    parentQuestion: -1,
    parentAnswer: -1,
    dataType: 'text',
    componentType: 'button'
  }];

  const data = {
    baseMapSource: 'DigitalGlobeRecentImagery',
    description: req.body.title,
    institution: config.ceo.institutionId,
    lonMin: bounds.minLng,
    lonMax: bounds.maxLng,
    latMin: bounds.minLat,
    latMax: bounds.maxLat,
    name: req.body.title,
    numPlots: '',
    plotDistribution: 'csv',
    plotShape: 'square',
    plotSize: req.body.plotSize,
    plotSpacing: '',
    privacyLevel: 'private',
    projectTemplate: '0',
    sampleDistribution: 'gridded',
    samplesPerPlot: '1',
    sampleResolution: '',
    sampleValues: sampleValues,
    surveyRules: [],
    useTemplatePlots: '',
    plotFileName: 'plots.csv',
    plotFileBase64: ',' + Buffer.from(plots).toString('base64'),
    sampleFileName: '',
    sampleFileBase64: '',
  };

  request.post({
    url: urljoin(config.ceo.url, 'create-project'),
    json: data
  }, function(error, response, body) {
    console.log(response.statusCode);
  });

  res.send(200);

});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
