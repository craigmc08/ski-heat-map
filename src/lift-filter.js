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

const extractPositionsFromPoint = track => [
    earthArcLength(track.latitude),
    earthArcLength(track.longitude),
    track.elevation,
]

const differentiateVectorArray = vectors => {
    const gradients = [];
    for (let i = 0; i < vectors; i++) {
        const startIndex = i === 0 ? 0 : i - 1;
        const startVec = vectors[startIndex];
        const endVec = vectors[startIndex + 1];

        const dx = endVec[0] - startVec[0];
        const dy = endVec[1] - startVec[1];
        const dz = endVec[2] - startVec[2];

        const gradient = [dx, dy, dz];
        gradients.push(gradient);
    }
    return gradients;
}

/**
 * Remove detected lift rides from a track
 * @param {Object[]} track - Array of all gps points
 * @returns {Object[]} Array of gps points that are not lift rides
 */
module.exports = function FilterLifts(track) {
    return track;
}