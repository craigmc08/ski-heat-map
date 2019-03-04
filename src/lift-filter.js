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
    for (let i = 0; i < vectors.length; i++) {
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
 * THIS DOESN'T WORK WELL
 * Remove detected lift rides from a track
 * @param {Object} options
 * @param {number} [options.accelerationThreshold] - Value of acceleration to be considered small
 * @param {number} [options.liftSandwichDistance] - Distance to look for lift rides
 * @returns {function(Object[]): Object[]} Filtering function
 */
const filterLiftsV1 = options => track => {
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

const differentiateScalarArray = scalars => {
    const derivatives = [];
    for (let i = 0; i < scalars.length; i++) {
        const startIndex = i === 0 ? 0 : i - 1;
        const start = scalars[startIndex];
        const end = scalars[startIndex + 1];

        const dy = end.y - start.y;
        const dt = end.t - start.t;
        derivatives.push({y: dy / (dt === 0 ? 1 : dt), t: scalars[i].t});
    }
    return derivatives;
};

/**
 * 
 * @param {Object} options
 * @param {number} [options.timeGoingUpHill] - How many seconds you must be going up before being marked as lift
 * @returns {function(Object[]): Object[]}
 */
const filterLiftsV2 = options => track => {
    const defaultOptions = {
        timeGoingUpHill: 5, // in seconds
    };
    const { timeGoingUpHill } = Object.assign({}, defaultOptions, options);

    const positions = track.map(point => ({
        y: point.elevation,
        t: point.time.getTime() / 1000,
    }));
    const velocities = differentiateScalarArray(positions);

    let isLift = [...new Array(velocities.length)].fill(false);
    let movedUp = false;
    let startedMovingUpTime = -1;
    let startedMovingUpIndex = -1;
    for (let i = 0; i < velocities.length; i++) {
        const movingUp = velocities[i].y > 0;
        if (movingUp && !movedUp) {
            startedMovingUpIndex = i;
            startedMovingUpTime = velocities[i].t;
        } else if (movedUp && !movingUp) {
            if (velocities[i-1].t - startedMovingUpTime > timeGoingUpHill) {
                console.log(`Filling from ${startedMovingUpIndex} to ${i}`);
                isLift = isLift.fill(true, startedMovingUpIndex, i);
            }
        }

        movedUp = movingUp;
    }

    const filteredTrack = track.filter((point, i) => !isLift[i]);
    return filteredTrack;
}

module.exports = filterLiftsV2;