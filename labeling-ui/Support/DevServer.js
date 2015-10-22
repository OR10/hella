import morgan from 'morgan';
import proxy from 'proxy-middleware';
import connect from 'connect';
import http from 'http';
import fs from 'fs';
import chalk from 'chalk';
import send from 'send';
import parseUrl from 'parseUrl';
import {Server as TinyLrServer} from 'tiny-lr';
import request from 'request-promise';

import IncrementalBuilder from './IncrementalBuilder';

export default class DevServer {
  constructor(config) {
    this.config = this.initializeConfig(config);

    const {baseURL, systemConfigPath, entryPointExpression, buildOptions} = this.config;

    this.builder = new IncrementalBuilder(baseURL, systemConfigPath, entryPointExpression, buildOptions);

    this.sourceCache = new Map();
  }

  initializeConfig(config) {
    const defaultConfig = {
      baseURL: process.cwd(),
      assetPath: `${process.cwd()}/Public`,
      systemConfigPath: 'system.config.js',
      entryPointExpression: 'main.js',
      buildOptions: {},
      bundleTargetUrl: '/labeling/Library/bundle.js',
      proxy: {
        protocol: 'http:',
        host: '192.168.222.20',
        pathname: '/',
        preserveHost: true,
        cookieRewrite: true,
        via: true,
      },
      port: 54321,
      livereloadPort: 35729,
    };

    return Object.assign({}, defaultConfig, config);
  }

  handleBuildError(res, error) {
    console.log(chalk.red('Build failed:'), error.message, '\n', error.stack); // eslint-disable-line no-console

    res.statusCode = 500;
    res.end('<h1>Build failed:</h1><pre>' + error.message + '</pre><pre>' + error.stack + '</pre>');
  }

  notifyChange(changedFile) {
    return Promise.all([
      this.sourceCache.delete(changedFile),
      this.builder.rebuild(changedFile),
      this.notifyLiveReload(changedFile),
    ]);
  }

  notifyLiveReload(changedFile) {
    const {livereloadPort} = this.config;
    return request(`http://localhost:${livereloadPort}/changed?files=${changedFile}`);
  }

  initializeLiveReload(port = 35729, options = {}) {
    const livereload = new TinyLrServer(options);
    return new Promise((resolve) => {
      livereload.listen(port, () => {
        resolve();
      });
    });
  }

  augmentSourceMap(sourceMap) {
    const {sources} = sourceMap;
    const augmentedMap = Object.assign({}, sourceMap);
    augmentedMap.sourcesContent = sources.map(file => this.getFileContents(file));
    return augmentedMap;
  }

  getFileContents(file) {
    const {baseURL} = this.config;

    if (!this.sourceCache.has(file)) {
      this.sourceCache.set(
        file,
        fs.readFileSync(`${baseURL}/${file}`, {encoding: 'utf-8'})
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

  createOneForAllTheThingzMiddleware(assetDirectory, target) {
    return (req, res, next) => {
      if (!req.url.match(/^\/labeling\//)) {
        return next();
      }

      const originalUrl = parseUrl.original(req);
      const pathname = parseUrl(req).pathname;
      let path = pathname.replace(/\/labeling\//, '/');
      if (path === '/' && originalUrl.pathname.substr(-1) !== '/') {
        path = '';
      }
      const stream = send(req, path, {
        root: assetDirectory,
      });

      stream.on('error', error => {
        if (error.code !== 'ENOENT') {
          return next(error);
        }

        fs.readFile(target, (err, content) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.setHeader('Content-Length', Buffer.byteLength(content));
          res.end(content);
        });
      });

      stream.pipe(res);
    };
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
    let {port} = this.config;
    const {livereloadPort, assetPath, proxy: proxyConfig} = this.config;

    if (process.env.PORT) {
      port = process.env.PORT;
    }

    Promise.resolve()
      .then(() => {
        const app = connect();
        app.use(morgan('dev'));
        app.use(this.serveSystemJsBundle.bind(this));
        app.use(this.createOneForAllTheThingzMiddleware(assetPath, `${assetPath}/index.html`));
        app.use(proxy(proxyConfig));
        return app;
      })
      .then(app => {
        return this.createServer(app, port);
      })
      .then(() => {
        console.log(chalk.green(`Server listening on port ${port}...`)); // eslint-disable-line no-console
      })
      .catch(error => {
        console.log(chalk.red('Error during server creation:'), error.message); // eslint-disable-line no-console
      })
      .then(() => {
        return this.initializeLiveReload(livereloadPort);
      })
      .then(() => {
        console.log(chalk.green(`Livereload server initialized on port ${livereloadPort}...`)); // eslint-disable-line no-console
      })
      .then(() => {
        return this.builder.getBundle();
      })
      .catch(error => {
        console.log(chalk.red('Initial bundle creation failed:'), error.message); // eslint-disable-line no-console
      });
  }
}
