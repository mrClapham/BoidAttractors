module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname+"/dist",
        filename: 'neon-worms-dist.js',
        libraryTarget: 'umd',
        library: 'NeonWorms'
    },

    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
