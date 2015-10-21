import serveStatic from 'serve-static';
import connect from 'connect';
import http from 'http';
import chalk from 'chalk';

export default class ProtractorServer {
  constructor(config) {
    this.config = this.initConfig(config);
    this.server = null;
  }

  initConfig(config) {
    const defaultConfig = {
      assetPath: 'Distribution',
      port: 52343
    };

    return Object.assign({}, defaultConfig, config);
  }

  createStaticFileServeMiddleware() {
    const {assetPath} = this.config;

    const options = {
      dotfiles: 'ignore',
      etag: 'true',
      fallthrough: true,
      index: ['index-protractor.html'],
      redirect: false,
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
        this.server = server;
        resolve(server);
      });

      server.listen(port);
    });
  }

  serve() {
    let {port} = this.config;

    if (process.env.PORT) {
      port = process.env.PORT;
    }

    Promise.resolve()
      .then(() => {
        return this.createStaticFileServeMiddleware();
      })
      .then(staticMiddleware => {
        const app = connect();
        app.use(staticMiddleware);
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
  }

  close() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}