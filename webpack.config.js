const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        use: 'ts-loader',
        test: /\.tsx?$/,
      },
    ],
  },
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
