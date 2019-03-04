module.exports.filterAnyOf = filters => (val, i, arr) =>
    filters.reduce((prev, filter) => prev || filter(val, i, arr), false)