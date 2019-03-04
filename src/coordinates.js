const earthRadiusFeet = 3950 * 5280;

const toRadian = degree => degree / 180 * Math.PI;

const arcLength = (angle, radius) => toRadian(angle) * radius;

const latitudeToDistance = latitude => arcLength(latitude, earthRadiusFeet);
const longitudeToDistance = (longitude, atLatitude) => {
    const radiusMultiplier = Math.cos(toRadian(atLatitude));
    return arcLength(longitude, earthRadiusFeet * radiusMultiplier);
}

module.exports.latitudeToDistance = latitudeToDistance;
module.exports.longitudeToDistance = longitudeToDistance;