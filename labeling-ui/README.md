# Labeling Tool Userinterface

This directory contains the User-Interface-Code for the HAGL Labeling Tool.

Everything concerning the Client-Side rendering of the UI, as well as it's server-side nodejs related code is stored here

## Prerequisites

The following software is required to build/run the project:

- [nodejs](https://nodejs.org) version 4.x
- [gulp](http://gulpjs.com/) (`npm install -g gulp`)
- [yarn] (https://yarnpkg.com/lang/en/)

## Installing dependencies

**Note:** All installation commands are for a macOS System. Linux and Windows may vary.

**Installing yarn:**
`brew install yarn`

**Installing [node-canvas](https://github.com/Automattic/node-canvas) dependencies**
`brew install pkg-config cairo pango libpng jpeg giflib`

## Setup

To initially setup the development environment, simply call `yarn`:

```shell
$ yarn
```

If you got a problem with compiling the `node-canvas` dependency at this point, make sure you
have got the XCode Commandline Tools installed. You can do so easily by issuing the following
command:

```
$ xcode-select --install
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

### E2E-Tests
Running the E2E tests requires Chromium. Use version `53.0.2785.0`.

### Unit Tests: MacOS
In order to run the unit tests under MacOS you need to increase the amount of max. open files:
```bash
echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf
echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=65536
ulimit -n 65536 65536
```


### Static Assets

Static assets will be served from the `Public` directory. Everything in this directory is automatically accessible from within the dev server.

**Reserved filepaths:** `lib/bundle.js` as well as `lib/bundle.js.map` are reserved and may not be used. Those two filepaths are internally redirected to the generated JavaScript source bundles.

### Proxying

Every request, which can not be satisfied by files from the `Public` directory, or the generated bundles, will be proxied to `192.168.222.20:80`, which is the default value of the `labeling-api` vm webserver.

### Livereload

Once the development server is started a [livereload](http://livereload.com/) server will be spawned automatically at the default port `35729`. It will be informed about any change in the JavaScript or asset folders.
