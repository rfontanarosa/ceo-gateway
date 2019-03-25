const express = require('express');
const request = require('request');
const urljoin = require('url-join');
const randomColor = require('randomcolor');

const turfHelpers = require('@turf/helpers');

const config = require('./config');
const {base64ShapeFromPlots} = require('./utils');

const app = express();

app.use(express.json());

app.get('/login', function(req, res) {
  const {url, username, password, institutionId} = config.ceo;
  request.post({
    url: urljoin(url, '/login'),
    form: {
      email: username,
      password: password,
    },
  }, function(error, response, body) {
    request.get({
      headers: {
        Cookie: response.headers['set-cookie'],
      },
      url: urljoin(url, 'account', institutionId),
      followRedirect: false,
    }, function(error, response1, body) {
      console.log(response1.statusCode);
    });
  });
  res.sendStatus(200);
});

app.post('/create-project', function(req, res) {
  const {url, institutionId} = config.ceo;
  const {classes, plotSize, plots, title} = req.body;

  const colors = randomColor({
    count: classes.length,
    hue: 'random',
  });

  const sampleValues = [{
    id: 1,
    question: 'CLASS',
    answers: classes.map(function(currentValue, index) {
      return {
        id: index + 1,
        answer: currentValue,
        color: colors[index],
      };
    }),
    parentQuestion: -1,
    parentAnswer: -1,
    dataType: 'text',
    componentType: 'button',
  }];

  const shapeFile = base64ShapeFromPlots(plotSize, plots);

  const data = {
    baseMapSource: 'DigitalGlobeRecentImagery',
    description: title,
    institution: institutionId,
    lonMin: '',
    lonMax: '',
    latMin: '',
    latMax: '',
    name: title,
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
    url: urljoin(url, 'create-project'),
    json: data,
  }, function(error, response, body) {
    console.log(response.statusCode);
  });

  res.send(200);
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
