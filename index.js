const express = require('express');
const request = require('request');
const urljoin = require('url-join');
const randomColor = require('randomcolor');

const config = require('./config');
const {base64ShapeFromPlots} = require('./utils');

const app = express();

app.use(express.json());

app.get('/login', function(req, res) {
  const {url, username, password, institutionId} = config.ceo;
  request.post({
    url: urljoin(url, 'login'),
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

  const plotFile = plots.reduce((acc, curr, i) => {
    return `${acc}\n${curr.lon},${curr.lat},${i+1}`;
  }, 'LON,LAT,PLOTID');

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
    plotDistribution: 'csv',
    plotShape: 'square',
    plotSize: plotSize,
    plotSpacing: '',
    privacyLevel: 'private',
    projectTemplate: '0',
    sampleDistribution: 'gridded',
    samplesPerPlot: '',
    sampleResolution: plotSize,
    sampleValues: sampleValues,
    surveyRules: [],
    useTemplatePlots: '',
    plotFileName: 'plots.zip',
    plotFileBase64: ',' + Buffer.from(plotFile).toString('base64'),
    sampleFileName: '',
    sampleFileBase64: '',
  };

  request.post({
    url: urljoin(url, 'create-project'),
    json: data,
  }, function(error, response, body) {
    console.log(response.statusCode);
  });

  res.send(200);
});

app.get('/get-collected-data/:id', function(req, res) {
  const {url} = config.ceo;
  const {id} = req.params;
  request.get({
    url: urljoin(url, 'get-project-by-id', id),
  }).on('data', function(data) {
    const project = JSON.parse(data);
    const {sampleValues} = project;
    const question = sampleValues[0].question;
    const answers = sampleValues[0].answers.reduce((acc, cur) => {
      acc[cur.answer] = cur.id;
      return acc;
    }, {});
    request.get({
      url: urljoin(url, 'dump-project-raw-data', id),
    }).on('data', function(data) {
      const lines = data.toString().split('\n');
      const qIndex = lines[0].split(',').findIndex((ele) => ele === question.toUpperCase());
      const ret = lines.slice(1).reduce((acc, cur) => {
        const values = cur.split(',');
        const answer = values[qIndex];
        return acc += `${values[0]},${values[2]},${values[3]},${answers[answer]}\n`;
      }, 'id,YCoordinate,XCoordinate,class\n');
      res.send(ret);
    }).on('error', function(err) {
      next(err);
    });
  }).on('error', function(err) {
    next(err);
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
