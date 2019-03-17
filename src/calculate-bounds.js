const coordinates = require('./coordinates');

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
        widthFeet: coordinates.longitudeToDistance(width, (north + south) / 2),
        heightFeet: coordinates.latitudeToDistance(height),
        depth,
        maxlat: north,
        minlat: south,
        maxlon: east,
        minlon: west,
    };
}

module.exports = CalculateTrackBounds;