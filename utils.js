const turfHelpers = require('@turf/helpers');
const fs = require('fs');
const shell = require('shelljs');
const uuidv4 = require('uuid/v4');

const base64ShapeFromPlots = (plotSize, plots) => {
  const dist = turfHelpers.lengthToDegrees(parseFloat(plotSize)/2, 'meters');
  const polygons = plots.map((curr, i) => {
    const lat = parseFloat(curr.lat);
    const lon = parseFloat(curr.lon);
    const square = [[lon - dist, lat - dist],
      [lon - dist, lat + dist],
      [lon + dist, lat + dist],
      [lon + dist, lat - dist],
      [lon - dist, lat - dist]];
    return turfHelpers.polygon([square], {PLOTID: i, SAMPLEID: i});
  });

  const polyFC = turfHelpers.featureCollection(polygons);

  const tempName = uuidv4();

  fs.writeFileSync(`${tempName}.json`, JSON.stringify(polyFC), 'utf8');

  if (!shell.which('ogr2ogr')) {
    throw new Error('ogr2ogr is not installed!');
  } else {
    const command = `ogr2ogr -f "ESRI Shapefile" ${tempName} ${tempName}.json`;
    if (shell.exec(command).code !== 0) {
      console.log('ERR2');
    } else {
      shell.cd(tempName);
      shell.exec('zip -q OGRGeoJSON.zip *');
      shell.cd('..');
    }
  }

  fs.unlinkSync(`${tempName}.json`);

  const shapeFile = fs.readFileSync(`./${tempName}/OGRGeoJSON.zip`);

  return Buffer.from(shapeFile).toString('base64');
};

module.exports = {base64ShapeFromPlots};
