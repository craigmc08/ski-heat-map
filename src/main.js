const loadTracks = require('./tracks-loader');
const drawTracks = require('./heatmap-drawer');
const calculateBounds = require('./calculate-bounds');

const PNG = require('pngjs').PNG;
const fs = require('fs');
const chalk = require('chalk');

const defaultOptions = {
    tracksDir: null,
    outputFile: null,
    imageWidth: 128,
    coordinatePaddingPercent: 0.05,
    filters: [],
};

const logInfo = str => console.log(chalk.white(str));
const logDetail = str => console.log(chalk.green.bold(str));
const formatNum = chalk.yellow.bold;

module.exports = async function Main(opts) {
    const startTime = Date.now();
    const options = Object.assign({}, defaultOptions, opts);

    const { tracksDir, outputFile, imageWidth, coordinatePaddingPercent, filters } = options;
    if (tracksDir === null) throw new TypeError('tracksDir is a required option, but is not given.');
    if (outputFile === null) throw new TypeError('outputFile is a required option, but is not given.');

    logInfo(`Loading tracks from ${formatNum(tracksDir)}`);
    const gpxs = await loadTracks(tracksDir);
    logInfo(`Tracks loaded`);

    const tracks = gpxs.map(gpx => gpx.tracks);

    logInfo(`Applying ${formatNum(opts.filters ? filters.length : 0)} track filters`);
    let filteredTracks = tracks;
    if (filters.length > 0) 
        filters.forEach(filter => filteredTracks = filteredTracks.map(segs => segs.map(filter)));

    // Combine all trksegs in all gpx files
    const flatten = arr => arr.reduce((flat, el) => flat.concat(el), []);
    const track = flatten(filteredTracks.map(trksegs => flatten(trksegs)));
    logInfo(`Tracks concatenated`);

    // Calculate track bounds
    const bounds = calculateBounds(track, coordinatePaddingPercent);
    
    logInfo(`Drawing heat map`);
    const { pixels, width, height } = drawTracks(track, bounds, imageWidth);
    logInfo(`Heatmap pixel data calculated`);

    logDetail(`Heatmap bound coordinates (degrees):
(${formatNum(bounds.maxlat)}, ${formatNum(bounds.maxlon)})
(${formatNum(bounds.minlat)}, ${formatNum(bounds.minlon)})`);
    
    logInfo(`Writing image to ${formatNum(outputFile)}`);

    const endTime = Date.now();
    const timeToComplete = (endTime - startTime) / 1000;
    logInfo(`Took ${formatNum(`${timeToComplete} second${timeToComplete !== 1 ? 's': ''}`)} to generate heatmap`);

    const image = new PNG({ width, height });
    image.data = pixels;

    image.pack().pipe(fs.createWriteStream(outputFile)).on('end', () => {
        console.log('Finished');
    });
}