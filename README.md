# CAP Scratchpad

Short, miscellaneous scripts and notes for Smogon's Create-a-Pokemon Project.

## How to install and run Breezi

1. [Install Node](http:s//node.js.org).
1. On the command line, run the following command:
    ```shell
    npm install
    npm run breezi
    ```
1. Install a userscript manager of your choice (e.g. Greasemonkey, Tampermonkey).
1. Save `dist/bundle.js` to your userscript manager.
1. Navigate to the appropriate forum thread.
1. Open your browser devtools.
1. Run the following in the devtools console:
    ```js
    await Breezi.makeSlate(location.href, "art");
    ```