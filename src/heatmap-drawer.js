const chalk = require('chalk');
const colors = require('./color-mappers');
const QuadTree = require('./quadtree');

const convertSpace = ([min1x, min1y], [max1x, max1y], [min2x, min2y], [max2x, max2y]) =>
    ([x, y]) => ([
        (x - min1x) / (max1x - min1x) * (max2x - min2x) + min2x,
        (y - min1y) / (max1y - min1y) * (max2y - min2y) + min2y
    ])

module.exports = function DrawHeatmap(track, bounds, imageWidth) {
    const imageAspect = bounds.widthFeet / bounds.heightFeet;
    const imageHeight = Math.floor(imageWidth / imageAspect);

    const worldToScreen = convertSpace(
        [bounds.minlon, bounds.minlat], [bounds.maxlon, bounds.maxlat],
        [0, 0], [imageWidth, imageHeight]
    );
    const screenToWorld = convertSpace(
        [0, 0], [imageWidth, imageHeight],
        [bounds.minlon, bounds.minlat], [bounds.maxlon, bounds.maxlat]
    );

    // Case for no data, basically
    const validDimension = dim => dim > 0 && dim !== Infinity && !isNaN(dim);
    if (!validDimension(imageWidth) || !validDimension(imageHeight)) {
        console.warn(chalk.black.bgRed('Warning: no track data was loaded. Check filters or tracks folder.'));
        return {
            pixels: new Uint8ClampedArray(4),
            width: 1,
            height: 1,
            bounds: {},
        };
    }
    const pixels = new Uint8ClampedArray(imageWidth * imageHeight * 4);

    const putPixel = (x, y, r, g, b, a) => {
        const i = (x + (imageHeight - y) * imageWidth) * 4;
        pixels[i] = r;
        pixels[i+1] = g;
        pixels[i+2] = b;
        pixels[i+3] = a;
    }

    const sqrDistThreshold = (bounds.width / 100) ** 2;

    const trackTree = new QuadTree(4, Math.sqrt(sqrDistThreshold), [bounds.minlat, bounds.minlon], [bounds.maxlat, bounds.maxlon]);
    track.forEach(point => trackTree.addLeaf([point.latitude, point.longitude], point));

    const countMap = [];
    let totalCount = 0;
    let countedPixels = 0;
    for (let y = 0; y < imageHeight; y++) {
        countMap[y] = [];
        for (let x = 0; x < imageWidth; x++) {
            let count = 0;
            const [lon, lat] = screenToWorld([x, y]);
            const nearbyPoints = trackTree.getLeavesNear([lat, lon]);
            for (let i = 0; i < nearbyPoints.length; i++) {
                const sqrDist = (lat - nearbyPoints[i].latitude)**2 + (lon - nearbyPoints[i].longitude)**2;
                if (sqrDist <= sqrDistThreshold) {
                    count += 1 - sqrDist / sqrDistThreshold;
                }
            }
            countMap[y][x] = count;
            totalCount += count;
            if (count > 0) countedPixels++;
        }
    }

    const avgCount = totalCount / countedPixels;
    for (let y = 0; y < imageHeight; y++) {
        for (let x = 0; x < imageWidth; x++) {
            const val = countMap[y][x] / (avgCount * 3);
            const c = colors.thermal(val);
            putPixel(x, y, c.r, c.g, c.b, c.a);
        }
    }

    return {
        pixels,
        width: imageWidth,
        height: imageHeight,
    };
}