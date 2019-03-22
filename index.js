var express = require('express');
var request = require('request');
var urljoin = require('url-join');
var randomColor = require('randomcolor');

var config = require('./config');
var { base64ShapeFromPlots } = require('./utils');

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

  const shapeFile = base64ShapeFromPlots(req.body.plotSize, req.body.plots);

  const data = {
    baseMapSource: 'DigitalGlobeRecentImagery',
    description: req.body.title,
    institution: config.ceo.institutionId,
    lonMin: '',
    lonMax: '',
    latMin: '',
    latMax: '',
    name: req.body.title,
    numPlots: '',
    plotDistribution: 'shp',
    plotShape: '',
    plotSize: '',
    plotSpacing: '',
    privacyLevel: 'private',
    projectTemplate: '0',
    sampleDistribution: 'shp',
    samplesPerPlot: '',
    sampleResolution: '',
    sampleValues: sampleValues,
    surveyRules: [],
    useTemplatePlots: '',
    plotFileName: 'plots.zip',
    plotFileBase64: ',' + shapeFile,
    sampleFileName: 'plots.zip',
    sampleFileBase64: ',' + shapeFile,
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
