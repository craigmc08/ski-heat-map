// Converts from a range [0, 1] to a color representing density

const { hsla, rgba, hsla2rgba, lerphsla } = require('./color');

module.exports.white = t => rgba(255, 255, 255, t);

module.exports.thermal = t => {
    if (t <= 1/3) {
        return rgba(0, 0, 255, t * 3/2);
    } else if (t <= 2/3) {
        return Object.assign(
            {},
            hsla2rgba(lerphsla(
                hsla(-120, 1, 0.5, 1),
                hsla(0, 1, 0.5, 1),
                (t - 1/3) * 3
            )),
            { a: t * 3/2 * 255 }
        );
    } else if (t <= 1) {
        return hsla2rgba(
            lerphsla(
                hsla(0, 1, 0.5, 1),
                hsla(60, 1, 0.5, 1),
                (t - 2/3) * 3
            )
        );
    } else {
        return hsla2rgba(
            lerphsla(
                hsla(60, 1, 0.5, 1),
                hsla(60, 1, 1, 1),
                (t - 1) / t
            )
        );
    }
}