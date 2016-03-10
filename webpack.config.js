module.exports = {
    entry: './js/neon-worms.js',
    output: {
        path: __dirname+"/dist",
        filename: 'neonworms.js',
        libraryTarget: 'umd',
        library: 'Neonworms'
    },

    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
