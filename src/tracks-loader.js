const parseGpx = require('@craigmc08/parse-gpx').parseFile;
const fs = require('fs');
const path = require('path');

module.exports = function LoadTracks(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, files) => {
            if (err) return reject(err);

            const gpxFiles = files
                .filter(file => file.endsWith('.gpx'))
                .map(file => path.resolve(dir, file))
            ;
            Promise.all(gpxFiles.map(parseGpx)).then(resolve).catch(reject);
        });
    });
}