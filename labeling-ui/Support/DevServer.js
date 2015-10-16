import morgan from "morgan";
import proxy from "proxy-middleware";
import connect from "connect";
import path from "path";
import http from "http";
import fs from "fs";
import chalk from "chalk";
import serveStatic from "serve-static";
import {Server as TinyLrServer} from "tiny-lr";
import request from "request-promise";

import IncrementalBuilder from "./IncrementalBuilder";

export default class DevServer {
  constructor(config) {
    this.config = this.initializeConfig(config);

    const {baseUrl, systemConfigPath, entryPointExpression, buildOptions} = this.config;

    this.builder = new IncrementalBuilder(baseUrl, systemConfigPath, entryPointExpression, buildOptions);

    this.sourceCache = new Map();
  }

  initializeConfig(config) {
    const defaultConfig = {
      baseUrl: process.cwd(),
      assetPath: `${process.cwd()}/Public`,
      systemConfigPath: "system.config.js",
      entryPointExpression: "main.js",
      buildOptions: {},
      bundleTargetUrl: "/lib/bundle.js",
      proxy: {
        protocol: 'http:',
        host: '192.168.222.20',
        pathname: '/'
      },
      port: 54321,
      livereloadPort: 35729
    };

    return Object.assign({}, defaultConfig, config);
  }

  handleBuildError(res, error) {
    console.log(chalk.red("Build failed:"), error.message, "\n", error.stack);

    res.statusCode = 500;
    res.end("<h1>Build failed:</h1><pre>" + error.message + "</pre><pre>" + error.stack + "</pre>");
  }

  notifyChange(changedFile) {
    return Promise.all([
      this.sourceCache.delete(changedFile),
      this.builder.rebuild(changedFile),
      this.notifyLiveReload(changedFile)
    ]);
  }

  notifyLiveReload(changedFile) {
    const {livereloadPort} = this.config;
    return request(`http://localhost:${livereloadPort}/changed?files=${changedFile}`);
  }

  initializeLiveReload(port = 35729, options = {}) {
    const livereload = new TinyLrServer(options);
    return new Promise((resolve, reject) => {
      livereload.listen(port, () => {
        resolve();
      })
    });
  }

  augmentSourceMap(sourceMap) {
    const {sources} = sourceMap;
    const augmentedMap = Object.assign({}, sourceMap);
    augmentedMap.sourcesContent = sources.map(file => this.getFileContents(file));
    return augmentedMap;
  }

  getFileContents(file) {
    const {baseUrl} = this.config;

    if (!this.sourceCache.has(file)) {
      this.sourceCache.set(
        file,
        fs.readFileSync(`${baseUrl}/${file}`, {encoding: "utf-8"})
      );
    }

    return this.sourceCache.get(file);
  }

  serveSystemJsBundle(req, res, next) {
    const {bundleTargetUrl} = this.config;

    if (req.url === bundleTargetUrl) {
      this.builder.getBundle()
        .then(output => {
          res.end(
            `${output.source}\n//# sourceMappingURL=${bundleTargetUrl}.map\n`
          );
        })
        .catch(this.handleBuildError.bind(this, res));
    } else if (req.url === `${bundleTargetUrl}.map`) {
      this.builder.getBundle()
        .then(output => {
          res.end(
            JSON.stringify(this.augmentSourceMap(JSON.parse(output.sourceMap)))
          );
        })
        .catch(this.handleBuildError.bind(this, res));
    } else {
      next();
    }
  }

  createStaticFileServeMiddleware() {
    const {assetPath} = this.config;

    const options = {
      dotfiles: "ignore",
      etag: "true",
      fallthrough: true,
      index: ["index.html"],
      redirect: false
    };

    return serveStatic(assetPath, options);
  }

  createServer(app, port) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);

      server.once('error', (error) => {
        reject(error);
      });

      server.once('listening', () => {
        resolve(server);
      });

      server.listen(port);
    });
  }

  serve() {
    let {port, livereloadPort, proxy: proxyConfig} = this.config;

    if (process.env.PORT) {
      port = process.env.PORT
    }

    Promise.resolve()
      .then(() => {
        return this.createStaticFileServeMiddleware();
      })
      .then(staticMiddleware => {
        const app = connect();
        app.use(morgan("dev"));
        app.use(this.serveSystemJsBundle.bind(this));
        app.use(staticMiddleware);
        app.use(proxy(proxyConfig));
        return app
      })
      .then(app => {
        return this.createServer(app, port);
      })
      .then(server => {
        console.log(chalk.green(`Server listening on port ${port}...`));
      })
      .catch(error => {
        console.log(chalk.red("Error during server creation:"), error.message);
      })
      .then(server => {
        return this.initializeLiveReload(livereloadPort);
      })
      .then(server => {
        console.log(chalk.green(`Livereload server initialized on port ${livereloadPort}...`));
      })
      .then(server => {
        this.builder.getBundle();
      })
      .catch(error => {
        console.log(chalk.red("Initial bundle creation failed:"), error.message);
      });
  }
}
