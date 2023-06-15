# CAP Scratchpad

Short, miscellaneous scripts and notes for Smogon's Create-a-Pokemon Project.

## How to download and run Breezi

1. Install a userscript manager of your choice to your browser of choice (
   e.g. [Tampermonkey](https://www.tampermonkey.net/)).
2. Add and save [`dist/bundle.js`](dist/bundle.js) to your userscript manager.

### From UI (recommended)

1. Navigate to the appropriate forum thread.
2. Click **▶**.
3. Select the correct tool + tool options to run.
4. Press **Submit**.

Any issues found by the selected tool will be displayed in your browser's developer console.

### From devtools (advanced)

1. Navigate to the appropriate forum thread.
2. Open your browser devtools.
3. Run the following in the devtools console:
    ```js
    await Breezi.makeSlate("art", location.href);
    ```

## For developers

### How to install

1. [Install Node](http:s//node.js.org).
2. On the command line, run `npm install`.

Run targets:

- build: `npm run breezi`
- format/lint: `npm run lint`
- test: `npm run test`