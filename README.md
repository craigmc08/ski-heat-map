# ski heat map
Generate heat maps from your skiing data.

## Usage
The Ski Tracks app exports data to the gpx format. Export the data you want and put all the files in a `tracks/` folder in this repositories root. Make sure you have node.js installed (this was made for Node v8.12.0).

Use the command
```
./ski-heat-map <tracksDirectory> <outputName> [options]
```

The options are:
```
-V, --version             output the version number
-w --width [imageWidth]   Width of image in pixels (default: 128)
-p --padding [padding]    Percent to increase width of output image to pad data (default: 1)
-f --filter [filterName]  Filter name to use, can be specified more than once for more filters (default: [])
-h, --help
```

Currently, it is not possible to adjust filter settings from the command line. Write a node.js script to have much more control over configuration.