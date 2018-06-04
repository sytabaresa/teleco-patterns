const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    stats: {
        colors: true
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    }
});