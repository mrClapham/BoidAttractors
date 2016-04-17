module.exports = {
    entry: './src/index.js',
    devtool: "source-map",
    output: {
        path: __dirname+"/dist",
        filename: 'NeonWorms.js',
        libraryTarget: 'umd',
        library: 'NeonWorms'
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
