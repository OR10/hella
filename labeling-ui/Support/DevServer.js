import IncrementalBuilder from "./IncrementalBuilder";
import morgan from "morgan";
import proxy from "proxy-middleware";
import connectStatic from "connect-static";
import connect from "connect";
import path from "path";
import http from "http";
import fs from "fs";

export default class DevServer {
  constructor(config) {
    this.config = this.initializeConfig(config);

    const {baseUrl, systemConfigPath, entryPointExpression, buildOptions} = this.config;

    this.builder = new IncrementalBuilder(baseUrl, systemConfigPath, entryPointExpression, buildOptions);

    this.staticFileServerOptions = {
      dir: baseUrl,
      aliases: [
        ['/', '/index.html']
      ],
      ignoreFile: (fullPath) => {
        var basename = path.basename(fullPath);
        return /^\./.test(basename) || /~$/.test(basename);
      },
      followSymlinks: true,
      cacheControlHeader: "max-age=0, must-revalidate"
    };

    this.sourceCache = new Map();
  }

  initializeConfig(config) {
    const defaultConfig = {
      baseUrl: process.cwd(),
      systemConfigPath: "system.config.js",
      entryPointExpression: "main.js",
      buildOptions: {},
      bundleTargetUrl: "/lib/bundle.js",
      proxy: {
        protocol: 'http:',
        host: '192.168.222.20',
        pathname: '/'
      },
      port: 54321
    };

    return Object.assign({}, defaultConfig, config);
  }

  handleBuildError(res, error) {
    console.log(chalk.red("Build failed:"), error.message, "\n", error.stack);

    res.statusCode = 500;
    res.end("<h1>Build failed:</h1><pre>" + error.message + "</pre><pre>" + error.stack + "</pre>");
  }

  notifyChange(changedFiles) {
    this.builder.rebuild(changedFiles);
  }

  serveSystemJsBundle(req, res, next) {
    const {bundleTargetUrl, baseUrl} = this.config;

    if (req.url === bundleTargetUrl) {
      this.builder.getBundle()
        .then(output => {
          var fullOutput = output.source + "\n//# sourceMappingURL=" + bundleTargetUrl + ".map\n";
          res.end(fullOutput);
        })
        .catch(this.handleBuildError.bind(this, res));
    } else if (req.url === bundleTargetUrl + ".map") {
      this.builder.getBundle()
        .then(output => {
          const sourceMapJson = JSON.parse(output.sourceMap);
          const files = sourceMapJson.sources;

          sourceMapJson.sourcesContent = files.map((file) => fs.readFileSync(`${baseUrl}/${file}`, {encoding: "utf-8"}));

          res.end(JSON.stringify(sourceMapJson));
        })
        .catch(this.handleBuildError.bind(this, res));
    } else {
      next();
    }
  }

  serve() {
    const app = connect();
    let {port, proxy: proxyConfig} = this.config;

    if (process.env.PORT) {
      port = process.env.PORT
    }

    this.builder.getBundle();

    connectStatic(this.staticFileServerOptions, (err, staticMiddleware) => {
      if (err) {
        throw err;
      }

      app.use(morgan("dev"));
      app.use(this.serveSystemJsBundle.bind(this));
      app.use(staticMiddleware);
      app.use(proxy(proxyConfig));

      const server = http.createServer(app);

      server.on('error', (error) => {
        console.log(error);
      });

      server.on('listening', () => {
        console.log("Server listening on port " + port);
      });

      server.listen(port);
    });
  }
}
