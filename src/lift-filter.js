/*

Strategy:
find velocity (mag and heading) for each gps point
make array of this

find acceleration of each gps point

for accelerations that are less than a certain threshold, mark these points as lifts

for points that are surrounded on both sides within some threshold of time by lift points,
mark these as lifts. this ensures slight turns are changes of direction of the lift is counted

remove all lift points

done

*/

const arcLength = radius => angle => radius * angle;
const earthRadius = 20900000; // In feet
const earthArcLength = arcLength(earthRadius);

const calculateVelocities = track => {
    const velocities = [];
    for (let i = 0; i < track.length; i++) {
        const startPoint = track[i === 0 ? 0 : i - 1];
        const endPoint = track[i === 0 ? 1 : i];

        const deltaLatitude = endPoint.latitude - startPoint.latitude;
        const deltaLongitude = endPoint.longitude - startPoint.longitude;
        
        const deltaLatFeet = earthArcLength(deltaLatitude);
        const deltaLonFeet = earthArcLength(deltaLongitude);
        const deltaEleFeet = endPoint.elevation - startPoint.elevation;

        const magnitude = Math.sqrt(deltaLatFeet*deltaLatFeet + deltaLonFeet*deltaLonFeet + deltaEleFeet*deltaEleFeet);
        const velocity = [
            deltaLatFeet / magnitude,
            deltaLonFeet / magnitude,
            deltaEleFeet / magnitude,
        ];

        velocities.push(velocity);
    }
    
    return velocities;
}

/**
 * Remove detected lift rides from a track
 * @param {Object[]} track - Array of all gps points
 * @returns {Object[]} Array of gps points that are not lift rides
 */
module.exports = function FilterLifts(track) {
    return track;
}