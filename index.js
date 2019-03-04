const liftFilter = require('./src/lift-filter');

require('./src/main')({
    tracksDir: './tracks',
    outputFile: './heatmap.png',
    imageWidth: 512,
    coordinatePaddingPercent: 0.01,
    filters: [
        liftFilter({}),
    ],
}).catch(err => {
    console.error(err);
});