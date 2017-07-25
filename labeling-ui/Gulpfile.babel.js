import gulp from 'gulp';
import {PluginError} from 'gulp-util';
import del from 'del';
import path from 'path';
import {sync as which} from 'which';
import gulpLoadPlugins from 'gulp-load-plugins';
import {Server as KarmaServer} from 'karma';
import fs from 'fs';
import jspm, {Builder} from 'jspm';
import sassJspm from 'sass-jspm-importer';
import run from 'run-sequence';
import {webdriver_update as webdriverUpdate, protractor} from 'gulp-protractor'; // eslint-disable-line camelcase
import ip from 'ip';
import chokidar from 'chokidar';
import {exec} from 'child_process';
import chalk from 'chalk';
import beepbeep from 'beepbeep';
import mkdirp from 'mkdirp-promise';
import crypto from 'crypto';

import DevServer from './Support/DevServer';
import ProtractorServer from './Tests/Support/ProtractorServer';

function chokidarWatch(glob, fn) {
  const watcher = chokidar.watch(glob);
  watcher.on('ready', () => {
    watcher.on('all', (...args) => fn(...args));
  });
}

/**
 * Execute a commandline and print its output to stdout/stderr
 *
 * @param {string} command
 * @param {object?} options
 * @param {function?} next
 */
function execLive(command, options, next) {
  if (typeof options === 'function') {
    // options have been skipped
    next = options; // eslint-disable-line no-param-reassign
    options = {}; // eslint-disable-line no-param-reassign
  }

  const child = exec(command, Object.assign({}, options, {maxBuffer: Number.MAX_SAFE_INTEGER}), next);

  child.stdout.on('data', data => {
    process.stdout.write(data);
  });

  child.stderr.on('data', data => {
    process.stderr.write(data);
  });
}

function execReturn(command, next) {
  let stdout = '';
  let stderr = '';

  const child = exec(
    command,
    {maxBuffer: Number.MAX_SAFE_INTEGER},
    () => next({stdout, stderr})
  );

  child.stdout.on('data', data => stdout += data);
  child.stderr.on('data', data => stderr += data);
}

function runProtractor(protractorConfig, protractorServerConfig, testFiles, next) {
  const augmentedProtractorConfig = Object.assign({}, protractorConfig);

  if (typeof process.env.PROTRACTOR_SELENIUM_GRID !== 'undefined') {
    augmentedProtractorConfig.args.push('--seleniumAddress', 'http://' + process.env.PROTRACTOR_SELENIUM_GRID + ':4444/wd/hub');
  }

  if (typeof process.env.EXTERNAL_IP_ADDRESS !== 'undefined') {
    augmentedProtractorConfig.args.push('--baseUrl', 'http://' + (process.env.EXTERNAL_IP_ADDRESS || ip.address()) + ':52343');
  } else {
    augmentedProtractorConfig.args.push('--baseUrl', 'http://localhost:52343');
  }

  const protractorServer = new ProtractorServer(protractorServerConfig);
  protractorServer.serve();

  gulp.src(testFiles)
    .pipe(protractor(augmentedProtractorConfig))
    .on('error', error => {
      protractorServer.close();
      throw error;
    })
    .on('end', () => {
      protractorServer.close();
      next();
    });
}

const $$ = gulpLoadPlugins({
  rename: {
    'gulp-angular-templatecache': 'angularTemplateCache',
  },
});

const paths = {};
paths.dir = {
  'application': 'Application',
  'support': 'Support',
  'vendor': 'Application/Vendor',
  'sass': 'Styles',
  'css': 'Distribution/Styles',
  'fonts': 'Distribution/Fonts',
  'tests': {
    'unit': 'Tests/Unit',
    'e2e': 'Tests/E2E',
    'functional': 'Tests/Functional',
    'fixtures': 'Tests/Fixtures',
  },
  'distribution': 'Distribution',
  'logs': 'Logs',
  'public': 'Public',
  'documentation': {
    'javascript': 'Documentation/JavaScript',
  },
};
paths.files = {
  'js': `${paths.dir.application}/**/*.js`,
  'support': `${paths.dir.support}/**/*.js`,
  'vendor': `${paths.dir.vendor}/**/*`,
  'sass': {
    'all': `${paths.dir.sass}/**/*.{scss,sass}`,
    'entrypoints': [`${paths.dir.sass}/**/*.{scss,sass}`, `!${paths.dir.sass}/**/_*.{scss,sass}`],
  },
  'css': `${paths.dir.css}/**/*.css`,
  'tests': {
    'unit': `${paths.dir.tests.unit}/**/*.js`,
    'e2e': `${paths.dir.tests.e2e}/**/*.js`,
    'functional': `${paths.dir.tests.functional}/**/*.js`,
  },
  'system': {
    'config': `${paths.dir.application}/system.config.js`,
  },
  'gulp': {
    'config': `Gulpfile.babel.js`,
  },
  'public': `${paths.dir.public}/**/*`,
};

gulp.task('create-directories', () => {
  return Promise.all([
    mkdirp(paths.dir.distribution),
    mkdirp(paths.dir.documentation.javascript),
    mkdirp(paths.dir.logs),
    mkdirp(paths.dir.css),
    mkdirp(paths.dir.fonts),
  ]);
});

gulp.task('clean', ['clean-logs'], () => {
  return del([
    `${paths.dir.distribution}/**/*`,
    `${paths.dir.documentation.javascript}/**/*`,
  ]);
});

gulp.task('clean-logs', ['create-directories'], next => {
  run(
    [
      'clean-e2e-logs',
      'clean-functional-logs',
    ],
    next
  );
});

gulp.task('clean-e2e-logs', ['create-directories'], next => {
  del([
    `${paths.dir.logs}/E2E/**/*`,
  ])
    .then(() => next())
    .catch(() => next());
});

gulp.task('clean-functional-logs', ['create-directories'], next => {
  del([
    `${paths.dir.logs}/Functional/**/*`,
  ])
    .then(() => next())
    .catch(() => next());
});

gulp.task('serve', next => { // eslint-disable-line no-unused-vars
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/
  run(
    'clean',
    'build-public',
    ['build-templates', 'build-sass', 'build-fonts'],
    () => {
      const devServer = new DevServer({
        'baseURL': './',
        'assetPath': `${__dirname}/Distribution`,
        'indexFilename': 'index-dev.html',
        'buildOptions': {
          'sfx': true,
          'lowResSourceMaps': true,
        },
        'entryPointExpression': 'Application/main.js',
      });

      devServer.serve();

      chokidarWatch(`${paths.dir.application}/**/*`, (event, filepath) => {
        const relativePath = path.relative(__dirname, filepath);
        devServer.notifyChange(relativePath);
      });

      chokidarWatch(paths.files.public, (event, filepath) => {
        const relativePath = path.relative(__dirname, filepath);
        run(
          'build-public',
          () => devServer.notifyChange(relativePath)
        );
      });

      chokidarWatch(paths.files.sass.all, (event, filepath) => {
        const relativePath = path.relative(__dirname, filepath);
        run(
          'build-sass',
          () => devServer.notifyChange(relativePath)
        );
      });
    }
  );
});

gulp.task('build-javascript', () => {
  const config = {
    'baseURL': './',
    'buildOptions': {
      'minify': false,
      'mangle': false,
      'sourceMaps': true,
    },
    'entryPointExpression': 'Application/main.js',
  };

  const builder = new Builder(config.baseURL, paths.files.system.config);
  return builder.buildStatic(
    config.entryPointExpression,
    `${paths.dir.distribution}/Library/bundle.js`,
    config.buildOptions
  );
});

gulp.task('build-public', () => {
  return gulp.src(paths.files.public)
    .pipe(gulp.dest(paths.dir.distribution));
});

gulp.task('build-release-config', next => {
  const releaseConfigPath = `${paths.dir.distribution}/Library`;
  const releaseConfigFile = `${releaseConfigPath}/release.config.json`;
  const releaseConfig = {};

  if (process.env.VERSION_STRING) {
    releaseConfig.revision = process.env.VERSION_STRING;
    mkdirp(releaseConfigPath)
      .then(() => fs.writeFile(releaseConfigFile, JSON.stringify(releaseConfig), next));
  } else {
    execReturn('git rev-parse --short HEAD', ({stdout}) => {
      releaseConfig.revision = stdout.trim();
      mkdirp(releaseConfigPath)
        .then(() => fs.writeFile(releaseConfigFile, JSON.stringify(releaseConfig), next));
    });
  }
});

gulp.task('build-iconfont', next => {
  let fontCustomBinary;
  try {
    fontCustomBinary = which('fontcustom');
  } catch (error) {
    throw new PluginError({
      plugin: 'FontCustom',
      message: `The fontcustom binary could not be found in your path. Please see README.md for details on how to install it.`,
    });
  }

  const fontCustomCommand = `${fontCustomBinary} compile`;
  const fontCustomWorkingDirectory = `${__dirname}/Resources/icons`;

  execLive(fontCustomCommand, {cwd: fontCustomWorkingDirectory}, next);
});

gulp.task('build', next => run(
  'clean',
  'build-public',
  'build-templates',
  'build-release-config',
  ['build-javascript', 'build-sass', 'build-fonts'],
  next
));

gulp.task('optimize-javascript', () => {
  return gulp.src(`${paths.dir.distribution}/Library/bundle.js`)
    .pipe($$.uglifyjs({
      mangle: true,
      warning: true,
      preserveComment: 'license',
      outSourceMap: `bundle.min.js.map`,
      inSourceMap: `${paths.dir.distribution}/Library/bundle.js.map`,
    }))
    .pipe($$.if('*.js', $$.rename({extname: '.min.js'})))
    .pipe(gulp.dest(`${paths.dir.distribution}/Library/`));
});

gulp.task('optimize', next => run(
  ['optimize-javascript', 'optimize-css'],
  next
));

gulp.task('package-javascript', () => {
  const bundlePath = `${paths.dir.distribution}/Library/bundle.min.js`;
  const hasher = crypto.createHash('sha256');
  hasher.update(
    fs.readFileSync(bundlePath)
  );
  const hash = hasher.digest('hex');

  return gulp.src([bundlePath, `${bundlePath}.map`])
    .pipe($$.rename(originalPath => {
      originalPath.basename = originalPath.basename.replace('bundle.', `bundle.${hash}.`);
    }))
  .pipe(gulp.dest(`${paths.dir.distribution}/Library`));
});

gulp.task('package-index', () => {
  const bundlePath = `${paths.dir.distribution}/Library/bundle.min.js`;
  const hasher = crypto.createHash('sha256');
  hasher.update(
    fs.readFileSync(bundlePath)
  );
  const hash = hasher.digest('hex');
  const hashedBundlePath = `Library/bundle.${hash}.min.js`;

  const indexPath = `${paths.dir.distribution}/index.html`;

  return gulp.src(indexPath)
    .pipe($$.htmlReplace({
      'javascript-bundle': hashedBundlePath,
    }))
    .pipe(gulp.dest(paths.dir.distribution));
});

gulp.task('package', next => run(
  ['package-index', 'package-javascript'],
  next
));

gulp.task('eslint', () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit,
    paths.files.tests.e2e,
  ])
    .pipe($$.eslint())
    .pipe($$.eslint.format())
    .pipe($$.eslint.failAfterError());
});

gulp.task('eslint-checkstyle', ['create-directories'], () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit,
    paths.files.tests.e2e,
  ])
    .pipe($$.eslint())
    .pipe($$.eslint.format('checkstyle', fs.createWriteStream('Logs/eslint.xml')))
    .pipe($$.eslint.failAfterError());
});

gulp.task('test-unit', next => {
  const karmaServer = new KarmaServer({
    'configFile': path.join(__dirname, '/karma.conf.js'),
  }, next);

  karmaServer.start();
});

gulp.task('test-unit-continuous', () => {
  const karmaServer = new KarmaServer({
    singleRun: false,
    autoWatch: true,
    reporters: ['jasmine-diff', 'mocha'],
    configFile: path.join(__dirname, '/karma.conf.js'),
  });

  karmaServer.start();
});

gulp.task('copy-canteen', () => {
  return jspm.normalize('canteen').then(normalizedFile => {
    const normalizedPath = normalizedFile
      .replace(/file:\/\//, '')
      .replace(/\.js$/, '');
    return gulp.src(normalizedPath + '/build/canteen.js')
      .pipe($$.rename('canteen.js'))
      .pipe(gulp.dest(paths.dir.distribution + '/Library'));
  });
});

gulp.task('webdriver-update', webdriverUpdate);

gulp.task('test-e2e-run', ['webdriver-update', 'copy-canteen'], next => {
  runProtractor(
    {
      configFile: 'protractor.e2e.conf.js',
      args: [],
    },
    {
      assetPath: 'Distribution',
      port: 52343,
    },
    [],
    next
  );
});

gulp.task('test-e2e-non-minified-run', ['webdriver-update', 'copy-canteen'], next => {
  runProtractor(
    {
      configFile: 'protractor.e2e.conf.js',
      args: [],
    },
    {
      assetPath: 'Distribution',
      port: 52343,
      indexFile: 'index-protractor.html',
    },
    paths.files.tests.e2e,
    next
  );
});

gulp.task('test-e2e', ['webdriver-update'], next => { // eslint-disable-line no-unused-vars
  run('clean', 'build', 'optimize', 'test-e2e-run', next);
});

gulp.task('test-e2e-non-minified', ['webdriver-update'], next => {
  run('clean', 'build', 'test-e2e-non-minified-run', next);
});

gulp.task('test-functional-run', ['webdriver-update', 'copy-canteen'], next => {
  runProtractor(
    {
      configFile: 'protractor.functional.conf.js',
      args: [],
    },
    {
      assetPath: 'Distribution',
      port: 52343,
      indexTemplate: {
        templateFile: `${paths.dir.distribution}/index-functional-template-min.html`,
        contentPath: `${paths.dir.tests.fixtures}/Functional`,
      },
    },
    paths.files.tests.functional,
    next
  );
});

gulp.task('test-functional-non-minified-run', ['webdriver-update', 'copy-canteen'], next => {
  runProtractor(
    {
      configFile: 'protractor.functional.conf.js',
      args: [],
    },
    {
      assetPath: 'Distribution',
      port: 52343,
      indexTemplate: {
        templateFile: `${paths.dir.distribution}/index-functional-template.html`,
        contentPath: `${paths.dir.tests.fixtures}/Functional`,
      },
    },
    paths.files.tests.functional,
    next
  );
});

gulp.task('test-functional', ['webdriver-update'], next => { // eslint-disable-line no-unused-vars
  run('clean', 'build', 'optimize', 'test-functional-run', next);
});

gulp.task('test-functional-non-minified', ['webdriver-update'], next => { // eslint-disable-line no-unused-vars
  run('clean', 'build', 'test-functional-non-minified-run', next);
});

gulp.task('build-sass', () => {
  return gulp.src(paths.files.sass.entrypoints)
    .pipe($$.sourcemaps.init())
    .pipe($$.plumber(function onError(error) {
      beepbeep();
      console.error(chalk.red('Error compiling Sass file.')); // eslint-disable-line no-console
      console.error(chalk.red(error.message)); // eslint-disable-line no-console
      this.emit('end');
    }))
    .pipe($$.sass({
      precision: 8,
      errLogToConsole: false,
      functions: sassJspm.resolve_function('Application/Vendor/'),
      importer: sassJspm.importer,
    }))
    .pipe($$.plumber.stop())
    .pipe($$.autoprefixer())
    .pipe($$.sourcemaps.write('./', {sourceRoot: null}))
    .pipe(gulp.dest(`${paths.dir.css}`));
});

gulp.task('build-fonts', next => {
  jspm.normalize('font-awesome').then(normalizedFile => {
    const normalizedPath = normalizedFile
      .replace(/file:\/\//, '')
      .replace(/\.js$/, '');

    gulp.src(`${normalizedPath}/fonts/**/*`)
      .pipe(gulp.dest(`${paths.dir.fonts}`))
      .on('end', next);
  });
});

gulp.task('deploy', () => {
  const deploymentIp = process.env.LABELING_UI_DEPLOY_IP;
  if (deploymentIp === undefined || deploymentIp === '') {
    throw new Error('Please set the environment variable LABELING_UI_DEPLOY_IP to the ip address that you want to deploy to.');
  }

  return gulp.src('Distribution/**')
    .pipe($$.rsync({
      recurse: true,
      exclude: [
        'index-protractor-min.html',
        'index-protractor.html',
        'index-functional-template.html',
        'index-functional-template-min.html',
        'index-dev.html',
        'Library/bundle.min.js',
        'Library/bundle.min.js.map',
      ],
      root: 'Distribution/',
      hostname: deploymentIp,
      destination: '/var/www/labeling-ui',
    }));
});

gulp.task('optimize-css', () => {
  return gulp.src(paths.files.css)
    .pipe($$.sourcemaps.init({loadMaps: true}))
    .pipe($$.minifyCss({
      sourceMapInlineSources: true,
    }))
    .pipe($$.rename({extname: '.min.css'}))
    .pipe($$.sourcemaps.write('./'))
    .pipe(gulp.dest(paths.dir.css));
});

gulp.task('build-templates', next => {
  run(
    ['build-foundation-templates'],
    next
  );
});

gulp.task('build-foundation-templates', () => {
  return gulp.src(paths.dir.vendor + '/**/foundation-apps*/js/angular/components/{accordion,modal}/*.html')
    .pipe($$.angularTemplateCache({
      filename: 'foundation-ui.js',
      module: 'AnnoStation.FoundationVendorTemplates',
      root: 'components/',
      standalone: true,
      base: template => path.basename(path.dirname(template.path)) + '/' + path.basename(template.path),
    }))
    .pipe(gulp.dest(paths.dir.distribution + '/Templates'));
});

gulp.task('documentation-javascript', next => {
  execLive('node_modules/.bin/jsdoc --configure jsdoc.conf.json', next);
});

gulp.task('documentation', next => {
  run(
    'clean',
    ['documentation-javascript'],
    next
  );
});

gulp.task('default', next => run(
  'clean',
  ['build', 'documentation'],
  'optimize',
  'package',
  next
));
