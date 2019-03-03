const loadTracks = require('./tracks-loader');
const drawTracks = require('./heatmap-drawer');
const { filterAnyOf } = require('./util');

const PNG = require('pngjs').PNG;
const fs = require('fs');

const defaultOptions = {
    tracksDir: null,
    outputFile: null,
    imageWidth: 128,
    coordinatePaddingPercent: 0.05,
    filters: [ () => true ],
};

module.exports = async function Main(opts) {
    const options = Object.assign({}, defaultOptions, opts);

    const { tracksDir, outputFile, imageWidth, coordinatePaddingPercent, filters } = options;
    if (tracksDir === null) throw new TypeError('tracksDir is a required option, but is not given.');
    if (outputFile === null) throw new TypeError('outputFile is a required option, but is not given.');

    console.log(`Loading tracks from ${tracksDir}`);
    const gpxs = await loadTracks(tracksDir);
    console.log(`Tracks loaded`);

    const tracks = gpxs.map(gpx => gpx.tracks);

    console.log(`Applying ${opts.filters ? filters.length : 0} track filters`);
    const filteredTracks = tracks.map(
        track => track.map(trkseg => trkseg.filter(filterAnyOf(filters)))
    );

    // Combine all trksegs in all gpx files
    const flatten = arr => arr.reduce((flat, el) => flat.concat(el), []);
    const track = flatten(filteredTracks.map(trksegs => flatten(trksegs)));
    console.log(`Tracks concatenated`);
    
    console.log(`Drawing heat map`);
    const { pixels, width, height, bounds } = drawTracks(track, imageWidth, coordinatePaddingPercent);
    console.log(`Heatmap pixel data calculated`);

    console.log(`Heatmap bound data:
(${bounds.maxlat}, ${bounds.maxlon})
(${bounds.minlat}, ${bounds.minlon})`);
    
    console.log(`Writing image to ${outputFile}`);

    const image = new PNG({ width, height });
    image.data = pixels;

    image.pack().pipe(fs.createWriteStream(outputFile)).on('end', () => {
        console.log('Finished');
    });
}