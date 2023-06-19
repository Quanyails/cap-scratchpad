const path = require('path');
const webpack = require('webpack');

const VERSION = new Date().toISOString().slice(0, 10);

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
      {
        resolve: {
          fullySpecified: false
        },
        test: /\.m?js/,
      },
    ],
  },
  mode: 'development',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // Make userscript-compatible
    // https://wiki.greasespot.net/Metadata_Block
    new webpack.BannerPlugin({banner: `// ==UserScript==
// @name         Breezi
// @author       Quanyails
// @description  CAP script utils
// @homepageURL  https://github.com/Quanyails/cap-scratchpad
// @grant        none
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @match        https://www.smogon.com/forums/*
// @namespace    https://github.com/Quanyails/
// @version      ${VERSION}
// ==/UserScript==`,
    raw: true,
    }),
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(VERSION),
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
