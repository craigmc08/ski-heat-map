const chalk = require('chalk');

function CalculateTrackBounds(track, paddingPercent) {
    let minlat = Infinity;
    let maxlat = -Infinity;
    let minlon = Infinity;
    let maxlon = -Infinity;
    let minele = Infinity;
    let maxele = -Infinity;
    for (let i = 0; i < track.length; i++) {
        minlat = minlat < track[i].latitude ? minlat : track[i].latitude;
        maxlat = maxlat > track[i].latitude ? maxlat : track[i].latitude;
        minlon = minlon < track[i].longitude ? minlon : track[i].longitude;
        maxlon = maxlon > track[i].longitude ? maxlon : track[i].longitude;
        minele = minele < track[i].elevation ? minele : track[i].elevation;
        maxele = maxele > track[i].elevation ? maxele : track[i].elevation;
    }

    const raw_width = (maxlon - minlon);
    const padding = raw_width * paddingPercent * 2;

    const width = raw_width + 2 * padding;
    const height = (maxlat - minlat) + 2 * padding;
    const depth = maxele - minele;

    const north = maxlat + padding;
    const south = minlat - padding;
    const east = maxlon + padding;
    const west = minlon - padding;

    return {
        width,
        height,
        depth,
        maxlat: north,
        minlat: south,
        maxlon: east,
        minlon: west,
    };
}

const convertSpace = ([min1x, min1y], [max1x, max1y], [min2x, min2y], [max2x, max2y]) =>
    ([x, y]) => ([
        (x - min1x) / (max1x - min1x) * (max2x - min2x) + min2x,
        (y - min1y) / (max1y - min1y) * (max2y - min2y) + min2y
    ])

module.exports = function DrawHeatmap(track, imageWidth, coordinatePaddingPercent) {
    const bounds = CalculateTrackBounds(track, coordinatePaddingPercent);

    const imageAspect = bounds.width / bounds.height;
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

    const countMap = [];
    let totalCount = 0;
    let countedPixels = 0;
    for (let y = 0; y < imageHeight; y++) {
        countMap[y] = [];
        for (let x = 0; x < imageWidth; x++) {
            let count = 0;
            const [lon, lat] = screenToWorld([x, y]);
            for (let i = 0; i < track.length; i++) {
                const sqrDist = (lat - track[i].latitude)**2 + (lon - track[i].longitude)**2;
                if (sqrDist <= sqrDistThreshold) count++;
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
            putPixel(x, y, 255, 255, 255, val * 255);
        }
    }

    return {
        pixels,
        width: imageWidth,
        height: imageHeight,
        bounds
    };
}