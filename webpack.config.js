var path = require("path")

module.exports = {
    entry: {
        index: './index.js'
    },
    output: {
        path: './',
        filename: 'bundle.js'
    },
    resolve: {
        root: [
            path.resolve('./'),
        ],
        modulesDirectories: [
            'bower_components',
            'node_modules'
        ],
        alias: {
            polymer: 'polymer/polymer',
        },
        extensions: ['', '.js', '.json']
    },
    debug: true,
    watch: true,
    watchDelay: 200,
    devtool: "#inline-source-map"
};
