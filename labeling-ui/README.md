# Labeling Tool Userinterface

This directory contains the User-Interface-Code for the HAGLA Labeling Tool.

Everything concerning the Client-Side rendering of the UI, as well as it's server-side nodejs related code is stored here

## Prerequisites

The following software is required to build/run the project:

- [nodejs](https://nodejs.org) version 4.2.x
- [gulp](http://gulpjs.com/)

## Setup

To initially setup the development environment, the following steps are required:

```shell
npm install
./node_modules/.bin/jspm install
```

## Development

During development a dev-server is required, which speeds up transpiling and bundling of the used JavaScript libraries and code.

This development server is started by issuing the following command:

```shell
gulp serve
```

It will run on port `54321` by default. To choose another port set the `PORT` environment variable accordingly:

```shell
PORT="12345" gulp serve
```

### Static Assets

Static assets will be served from the `Public` directory. Everything in this directory is automatically accessible from within the dev server.

**Reserved filepaths:** `lib/bundle.js` as well as `lib/bundle.js.map` are reserved and may not be used. Those two filepaths are internally redirected to the generated JavaScript source bundles.

### Proxying

Every request, which can not be satisfied by files from the `Public` directory, or the generated bundles, will be proxied to `192.168.222.20:80`, which is the default value of the `labeling-api` vm webserver.

### Livereload

Once the development server is started a [livereload](http://livereload.com/) server will be spawned automatically at the default port `35729`. It will be informed about any change in the JavaScript or asset folders.
