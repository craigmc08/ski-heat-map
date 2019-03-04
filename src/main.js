const loadTracks = require('./tracks-loader');
const drawTracks = require('./heatmap-drawer');
const { filterAnyOf } = require('./util');

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
const logDetail = str => console.log(chalk.green(str));

module.exports = async function Main(opts) {
    const options = Object.assign({}, defaultOptions, opts);

    const { tracksDir, outputFile, imageWidth, coordinatePaddingPercent, filters } = options;
    if (tracksDir === null) throw new TypeError('tracksDir is a required option, but is not given.');
    if (outputFile === null) throw new TypeError('outputFile is a required option, but is not given.');

    logInfo(`Loading tracks from ${chalk.yellow(tracksDir)}`);
    const gpxs = await loadTracks(tracksDir);
    logInfo(`Tracks loaded`);

    const tracks = gpxs.map(gpx => gpx.tracks);

    logInfo(`Applying ${chalk.yellow(opts.filters ? filters.length : 0)} track filters`);
    let filteredTracks = tracks;
    if (filters.length > 0) 
        filters.forEach(filter => filteredTracks = tracks.map(segs => segs.map(filter)));

    // Combine all trksegs in all gpx files
    const flatten = arr => arr.reduce((flat, el) => flat.concat(el), []);
    const track = flatten(filteredTracks.map(trksegs => flatten(trksegs)));
    logInfo(`Tracks concatenated`);
    
    logInfo(`Drawing heat map`);
    const { pixels, width, height, bounds } = drawTracks(track, imageWidth, coordinatePaddingPercent);
    logInfo(`Heatmap pixel data calculated`);

    logDetail(`Heatmap bound coordinates (degrees):
(${chalk.yellow(bounds.maxlat)}, ${chalk.yellow(bounds.maxlon)})
(${chalk.yellow(bounds.minlat)}, ${chalk.yellow(bounds.minlon)})`);
    
    logInfo(`Writing image to ${chalk.yellow(outputFile)}`);

    const image = new PNG({ width, height });
    image.data = pixels;

    image.pack().pipe(fs.createWriteStream(outputFile)).on('end', () => {
        console.log('Finished');
    });
}