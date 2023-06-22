const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const VERSION = new Date().toISOString().slice(0, 10);

// Make userscript-compatible
// https://wiki.greasespot.net/Metadata_Block
const METADATA = `// ==UserScript==
// @name         Breezi
// @author       Quanyails
// @description  CAP script utils
// @homepageURL  https://github.com/Quanyails/cap-scratchpad
// @grant        none
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @match        https://www.smogon.com/forums/*
// @namespace    https://github.com/Quanyails/
// @version      ${VERSION}
// ==/UserScript==`;

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
  optimization: {
    minimizer: [
      // Preserves banner in prod build
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
            preamble: METADATA,
          }
        }
      })
    ],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    // Preserves banner in dev build
    new webpack.BannerPlugin({
      banner: METADATA,
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
