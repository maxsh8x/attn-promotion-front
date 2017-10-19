const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  context: resolve(__dirname, 'src'),
  entry: [
    './App.jsx',
  ],
  output: {
    filename: 'bundle.js',
    path: resolve(__dirname, 'dist'),
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: [
          'babel-loader',
        ],
        exclude: /node_modules/,
      },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.css$/,
        oneOf: [
          {
            exclude: /antd/,
            use: [
              'style-loader',
              'css-loader?modules',
            ],
          },
          {
            include: /antd/,
            use: [
              'style-loader',
              'css-loader',
            ],
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
    }),
  ],
};
