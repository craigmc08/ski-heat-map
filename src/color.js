/**
 * @param {number} r - red [0..255]
 * @param {number} g - green [0..255]
 * @param {number} b - blue [0..255]
 * @param {number} a - alpha [0, 1]
 * @returns {Object}
 */
module.exports.rgba = (r, g, b, a) => ({
    r, g, b, a: a * 255
});

/**
 * @param {number} h - hue in degrees [-360, 360]
 * @param {number} s - saturation [0, 1]
 * @param {number} l - luminance [0, 1]
 * @param {number} a - alpha [0, 1]
 * @returns {Object}
 */
module.exports.hsla = (h, s, l, a) => ({
    h, s, l, a
});

const lerp = (a, b, t) => (b - a) * Math.min(Math.max(t, 0), 1) + a;
/**
 * lerp between 2 hsla colors
 * @param {Object} a - First color
 * @param {Object} b - Second color
 * @returns {Object}
 */
module.exports.lerphsla = (a, b, t) => ({
    h: (Math.abs(b.h - a.h) <= 180) ? lerp(a.h, b.h, t) : lerp(b.h - 360, a.h, t),
    s: lerp(a.s, b.s, t),
    l: lerp(a.l, b.l, t),
    a: lerp(a.a, b.a, t),
});

/**
 * Convert from hsla to rgb
 */
module.exports.hsla2rgba = (hsla) => {
    // Theoretically converts any degree to between 0 and 360
    const h = hsla.h >= 0 ? hsla.h % 360 : Math.ceil(-hsla.h / 360) * 360 + hsla.h;
    const { s, l, a } = hsla;
    // conversion from https://www.rapidtables.com/convert/color/hsl-to-rgb.html
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;

    let rp = 0, gp = 0, bp = 0;
    if (h <= 60) rp = c, gp = x, bp = 0;
    else if (h <= 120) rp = x, gp = c, bp = 0;
    else if (h <= 180) rp = 0, gp = c, bp = x;
    else if (h <= 240) rp = 0, gp = x, bp = c;
    else if (h <= 300) rp = x, gp = 0, bp = c;
    else rp = c, gp = 0, bp = x;

    return {
        r: (rp + m) * 255,
        g: (gp + m) * 255,
        b: (bp + m) * 255,
        a: a * 255
    };
}