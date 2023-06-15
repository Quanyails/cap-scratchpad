# Pokemon Showdown! Server on Google Cloud Platform (GCP)

## Motivation

More browsers nowadays enforce HTTPS. This makes it hard to share a
Pokemon Showdown server for testing purposes, as you need to serve the data
from a secure server.

You could disable DNS over HTTPS as such:

- Chrome: `chrome://flags/#enable-async-dns` > Disabled
- Firefox: `about:preferences` > Network Settings > Settings ... >
  Enable DNS over HTTPS > Disabled

However, doing so is discouraged; this is quite the technical workaround for
the average user, and making this change exposes the browser to security issues.
Thus, we want to find a more practical solution.

## Options

We have multiple options for setting up a public, secure server. Some options
include:

- Amazon Web Services: This most likely works, but I find other options more
  user-friendly than AWS.
- Cloudflare Quick Tunnels: This option is dead-easy to set up
  ([thanks, Fireship](https://www.youtube.com/watch?v=SlBOpNLFUC0)). However,
  there's no easy way to create a stable domain for your server; Quick Tunnels
  use randomized domains, and you would need to set up static domains yourself.
- Google Cloud Platform:
  - App Engine: This option requires zero management. However, App Engine
  enforces read-only file systems, while Showdown! requires
  read/write access. There is no workaround to this limitation without editing
  server code.
  - Cloud Run: Requires knowledge of Docker. Otherwise, generates a stable URL +
    an SSL certificate for our Showdown! server.
  - Compute Engine: This option offers maximum flexibility. However,
  you're required to manage the plumbing yourself, making it inconvenient if
  all you want is a Node server.
- Heroku: Requires a paid plan.
- Ngrok: Requires a paid plan for a static domain.

Looking at the pros and cons, GCP Cloud Run provides the right balance between
server requirements, ease of setup, and cost.

To set up a GCP account, you need a valid credit card for billing purposes.
However, you shouldn't pay much; [the cost of a Pokemon Showdown! server should
be fairly minimal.](https://cloud.google.com/run/pricing)

## Setup

1. [Register your Pokemon Showdown server.](https://pokemonshowdown.com/servers/)
2. Make the following changes to your Showdown! server code:
  - `config/config.js`
    ```js
    exports.serverid = 'server-name'; // This maps to <server-name>.psim.us
    ```
  - `Dockerfile`
    ```dockerfile
    FROM node:19-alpine
    WORKDIR /usr/src/app
    COPY .. ./
    RUN npm ci --only=production
    CMD ["npm", "start"]
    ```
3. [Create a GCP account + project.](https://console.cloud.google.com/getting-started)
4. [Open Google Cloud Shell.](https://shell.cloud.google.com/)
5. Copy, build, and deploy the server:

    ``` shell
    git clone https://github.com/<username>/Pokemon-Showdown.git
    cd Pokemon-Showdown
    gcloud config set project <gcp-project>
    gcloud config set run/region <region>
    gcloud run deploy pokemon-showdown \
     --allow-unauthenticated \
     --max-instances=4 \
     --memory='2Gi' \
     --port=8000 \
     --region=us-east4 \
     --source=. \
     --timeout=60m
    gcloud run services update-traffic pokemon-showdown --to-latest
    ```
- Notes:
  - [The official Cloud Run documentation](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-nodejs-service)
    provides comprehensive overview of how to set up a Node.js server.
  - By default, [Cloud Run instances kick users off after 5 minutes of inactivity](https://cloud.google.com/run/docs/triggering/websockets#client-reconnects).
    We set `--timeout` to the maximum possible value to mitigate this behavior.
  - If you run into any errors starting the server, [check your project logs.](https://console.cloud.google.com/logs/query)
6. Once the server is built and deployed, you will see the server URL in your
   Cloud Shell console. Find the server address and [set your server location.](https://pokemonshowdown.com/servers/)
7. Navigate to `<server-name>.psim.us` and verify your server connection.

<!--
Miscellaneous resources:

- https://domains.google.com
- https://medium.com/@kakiang/mapping-a-cloud-run-service-to-a-custom-domain-9c9895037551
-->
