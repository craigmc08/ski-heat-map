require('./src/main')({
    tracksDir: './tracks',
    outputFile: './heatmap.png',
    imageWidth: 512,
    coordinatePaddingPercent: 0.05,
}).catch(err => {
    console.error(err);
});