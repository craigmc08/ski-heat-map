const program = require('commander');
const chalk = require('chalk');

const liftFilter = require('./src/lift-filter');

const collect = (val, memory) => {
    memory.push(val);
    return memory;
}

const getFilterByName = name =>
    name === 'remove-lifts' ? liftFilter({})
    : null
;

program
    .version('0.1.0')
    .arguments('<tracksDirectory> <outputName>')
    .option('-w --width [imageWidth]', 'Width of image in pixels', Number, 128)
    .option('-p --padding [padding]', 'Percent to increase width of output image to pad data', parseFloat, 1)
    .option('-f --filter [filterName]', 'Filter name to use, can be specified more than once for more filters', collect, [])
    .action(processCommand)
    .parse(process.argv)
;

function processCommand(tracksDirectory, outputName, cmd) {
    const filters = cmd.filter.map(getFilterByName).filter(filter => !!filter);

    const options = {
        tracksDir: tracksDirectory,
        outputFile: outputName,
        imageWidth: cmd.width,
        coordinatePaddingPercent: cmd.padding / 100,
        filters,
    };

    require('./src/main')(options).catch(err => {
        console.log(chalk.red.bold('Something went wrong. Here\'s the error it made.'));
        console.error(err);
    });
}