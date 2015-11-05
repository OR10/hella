import connect from 'connect';
import http from 'http';
import chalk from 'chalk';
import send from 'send';
import parseUrl from 'parseurl';
import fs from 'fs';
import createStatic from 'connect-static';

export default class ProtractorServer {
  constructor(config) {
    this.config = this.initConfig(config);
    this.server = null;
  }

  initConfig(config) {
    const defaultConfig = {
      assetPath: 'Distribution',
      port: 52343,
    };

    return Object.assign({}, defaultConfig, config);
  }

  createServer(app, port) {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);

      server.once('error', (error) => {
        reject(error);
      });

      server.once('listening', () => {
        this.server = server;
        resolve(server);
      });

      server.listen(port);
    });
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

  createFixturesMiddleware() {
    const options = {
      dir: `${process.cwd()}/Tests/Fixtures/Images`,
    };

    return new Promise((resolve, reject) => {
      createStatic(options, (err, middleware) => {
        if (err) {
          reject(err);
        } else {
          resolve(middleware);
        }
      });
    });
  }

  serve() {
    let {port, assetPath} = this.config;

    if (process.env.PORT) {
      port = process.env.PORT;
    }

    Promise.resolve()
      .then(this.createFixturesMiddleware)
      .then((fixturesMiddleware) => {
        const app = connect();
        app.use('/fixtures/images', fixturesMiddleware);
        app.use(this.createOneForAllTheThingzMiddleware(assetPath, `${assetPath}/index-protractor.html`));
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
      });
  }

  close() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}