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

const extractPositionFromPoint = trackPoint => ({
    x: earthArcLength(trackPoint.latitude),
    y: earthArcLength(trackPoint.longitude),
    z: trackPoint.elevation,
    time: new Date(trackPoint.time).getTime() / 1000,
})

const differentiateVectorArray = vectors => {
    const gradients = [];
    for (let i = 0; i < vectors; i++) {
        const startIndex = i === 0 ? 0 : i - 1;
        const startVec = vectors[startIndex];
        const endVec = vectors[startIndex + 1];

        const dx = endVec.x - startVec.x;
        const dy = endVec.y - startVec.y;
        const dz = endVec.z - startVec.z;
        const dt = endVec.time - startVec.time;

        const gradient = {
            x: dx / dt,
            y: dy / dt,
            z: dz / dt,
            time: vectors[i].time,
        };
        gradients.push(gradient);
    }
    return gradients;
}

const sqrMagnitude = vector => vector.x*vector.x + vector.y*vector.y + vector.z*vector.z;

const isSandwiched = (bread, maxBreadDistance) => breadArray => {
    const meatArray = [];
    for (let i = 0; i < breadArray.length; i++) {
        const isAtEnd = i < maxBreadDistance || i > breadArray.length - maxBreadDistance;
        if (isAtEnd) {
            meatArray.push(false);
            continue; // I'm sorry
        }

        let sandwiched = false;
        for (let j = i - maxBreadDistance; j < i + maxBreadDistance && !sandwiched; j++) {
            if (breadArray[j] === bread) sandwiched = true;
        }
        meatArray.push(sandwiched);
    }

    return meatArray;
}

/**
 * Remove detected lift rides from a track
 * @param {Object[]} track - Array of all gps points
 * @param {Object} options
 * @param {number} options.accelerationThreshold - Value of acceleration to be considered small
 * @param {number} options.liftSandwichDistance - Distance to look for lift rides
 * @returns {Object[]} Array of gps points that are not lift rides
 */
module.exports = function FilterLifts(track, options) {
    const defaultOptions = {
        accelerationThreshold: 0.1,
        liftSandwichDistance: 5,
    };
    const { accelerationThreshold, liftSandwichDistance } = Object.assign(
        {}, defaultOptions, options
    );

    const positions = track.map(extractPositionFromPoint);
    const velocities = differentiateVectorArray(positions);
    const accelerations = differentiateVectorArray(velocities);

    const hasSmallAcceleration = accelerations.map(acceleration => (
        sqrMagnitude(acceleration) < accelerationThreshold
    ));

    const isSandwichedByLifts = isSandwiched(true, liftSandwichDistance)(hasSmallAcceleration);

    // && the 2 filter arrays
    const isLiftPoint = hasSmallAcceleration.map((hsa, i) => hsa || isSandwichedByLifts[i]);

    const filteredTrack = track.filter((point, i) => !isLiftPoint[i]);

    return filteredTrack;
}