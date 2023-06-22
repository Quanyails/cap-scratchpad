# CAP Scratchpad

Short, miscellaneous scripts and notes for Smogon's Create-a-Pokemon Project.

## How to use Breezi

### Install

1. Install a userscript manager of your choice to your browser of choice (
   e.g. [Tampermonkey](https://www.tampermonkey.net/)).
2. Add and save [`dist/bundle.js`](dist/bundle.js) to your userscript manager.

### Run from UI

1. Navigate to the appropriate forum thread.
2. Click **▶**.
3. Select the correct tool + tool options to run.
4. Press **Submit**.

Any issues found by the selected tool will be displayed in your browser's developer console.

## For developers

### How to install

1. [Install Node](http:s//node.js.org).
2. On the command line, run `npm install`.

Run targets:

- all: `npm run all`
- build: `npm run dev` or `npm run prod`
- format: `npm run format`
- lint: `npm run lint`
- test: `npm run test`