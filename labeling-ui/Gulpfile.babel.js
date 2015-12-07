import gulp from 'gulp';
import del from 'del';
import path from 'path';
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

import DevServer from './Support/DevServer';
import ProtractorServer from './Tests/Support/ProtractorServer';

function chokidarWatch(glob, fn) {
  const watcher = chokidar.watch(glob);
  watcher.on('ready', () => {
    watcher.on('all', (...args) => fn(...args));
  });
}

function execLive(command, next) {
  const child = exec(command, {maxBuffer: Number.MAX_SAFE_INTEGER}, next);

  child.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  child.stderr.on('data', (data) => {
    process.stderr.write(data);
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
    'e2e': 'Test/E2E',
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
  },
  'system': {
    'config': `${paths.dir.application}/system.config.js`,
  },
  'gulp': {
    'config': `Gulpfile.babel.js`,
  },
  'public': `${paths.dir.public}/**/*`,
};

gulp.task('clean', () => {
  return del([
    `${paths.dir.distribution}/**/*`,
    `${paths.dir.logs}/**/*`,
    `${paths.dir.documentation.javascript}/**/*`,
  ]);
});

gulp.task('clean-logs', () => {
  return del([
    `${paths.dir.logs}/**/*`,
  ]);
});

gulp.task('serve', (next) => { // eslint-disable-line no-unused-vars
  /**
   * next is intentionally never called, as 'serve' is an endless task
   * Do not remove the next from the function signature!
   **/
  run(
    'clean',
    'build-public',
    ['build-templates', 'build-sass', 'build-fonts', 'build-icons'],
    () => {
      const devServer = new DevServer({
        'baseURL': './',
        'assetPath': `${__dirname}/Distribution`,
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

gulp.task('build', next => run(
  'build-public',
  'build-templates',
  ['build-javascript', 'build-sass', 'build-fonts', 'build-icons'],
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

gulp.task('eslint', () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit,
  ])
    .pipe($$.eslint())
    .pipe($$.eslint.format());
});

gulp.task('eslint-checkstyle', () => {
  return gulp.src([
    `!${paths.files.vendor}`,
    `!${paths.files.system.config}`,
    paths.files.gulp.config,
    paths.files.support,
    paths.files.js,
    paths.files.tests.unit,
  ])
    .pipe($$.eslint())
    .pipe($$.eslint.format('checkstyle', fs.createWriteStream('Logs/eslint.xml')));
});

gulp.task('test-unit', (next) => {
  const karmaServer = new KarmaServer({
    'configFile': path.join(__dirname, '/karma.conf.js'),
  }, next);

  karmaServer.start();
});

gulp.task('test-unit-continuous', () => {
  const karmaServer = new KarmaServer({
    singleRun: false,
    autoWatch: true,
    configFile: path.join(__dirname, '/karma.conf.js'),
  });

  karmaServer.start();
});

gulp.task('webdriver-update', webdriverUpdate);

gulp.task('test-e2e-run', ['webdriver-update', 'clean-logs'], (next) => {
  const protractorConfig = {
    configFile: 'protractor.conf.js',
    args: [],
  };

  if (typeof process.env.PROTRACTOR_SELENIUM_GRID !== 'undefined') {
    protractorConfig.args.push('--baseUrl', 'http://' + ip.address() + ':52343');
    protractorConfig.args.push('--seleniumAddress', 'http://' + process.env.PROTRACTOR_SELENIUM_GRID + ':4444/wd/hub');
  } else {
    protractorConfig.args.push('--baseUrl', 'http://localhost:52343');
  }

  const protractorServer = new ProtractorServer({
    assetPath: 'Distribution',
    port: 52343,
  });

  protractorServer.serve();

  gulp.src(paths.files.tests.e2e)
    .pipe(protractor(protractorConfig))
    .on('error', (error) => {
      protractorServer.close();
      throw error;
    })
    .on('end', () => {
      protractorServer.close();
      next();
    });
});

gulp.task('test-e2e', ['webdriver-update'], (next) => { // eslint-disable-line no-unused-vars
  run('clean', 'build', 'optimize', 'test-e2e-run');
});

gulp.task('build-sass', () => {
  return gulp.src(paths.files.sass.entrypoints)
    .pipe($$.sourcemaps.init())
    .pipe($$.sass({
      precision: 8,
      errLogToConsole: true,
      functions: sassJspm.resolve_function('Application/vendor/'),
      importer: sassJspm.importer,
    }))
    .pipe($$.autoprefixer())
    .pipe($$.sourcemaps.write('./', {sourceRoot: null}))
    .pipe(gulp.dest(`${paths.dir.css}`));
});

gulp.task('build-fonts', (next) => {
  jspm.normalize('font-awesome').then((normalizedFile) => {
    const normalizedPath = normalizedFile
      .replace(/file:\/\//, '')
      .replace(/\.js$/, '');

    gulp.src(`${normalizedPath}/fonts/**/*`)
      .pipe(gulp.dest(`${paths.dir.fonts}`))
      .on('end', next);
  });
});

gulp.task('build-icons', () => {
  return gulp
    .src('Public/Images/icons/*.svg')
    .pipe($$.svgmin((file) => {
      const prefix = path.basename(file.relative, path.extname(file.relative));
      return {
        plugins: [{
          convertColors: {
            names2hex: true,
            rgb2hex: true,
          },
        }, {
          removeComments: true,
        }, {
          cleanupIDs: {
            prefix: prefix + '-',
            minify: true,
          },
        }],
      };
    }))
    .pipe($$.svgstore())
    .pipe(gulp.dest(`${paths.dir.distribution}`));
});

gulp.task('deploy', () => {
  const deploymentIp = process.env.LABELING_UI_DEPLOY_IP;
  if (deploymentIp === undefined || deploymentIp === '') {
    throw new Error('Please set the environment variable LABELING_UI_DEPLOY_IP to the ip address that you want to deploy to.');
  }

  return gulp.src('Distribution/**')
    .pipe($$.rsync({
      recurse: true,
      exclude: ['index-protractor.html'],
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

gulp.task('build-templates', (next) => {
  run(
    ['build-angular-bootstrap-templates', 'build-foundation-templates'],
    next
  );
});

gulp.task('build-angular-bootstrap-templates', () => {
  return gulp.src(paths.dir.vendor + '/**/angular-ui/bootstrap*/template/{collapse,accordion,carousel,tooltip,popover}/*.html')
    .pipe($$.angularTemplateCache({
      filename: 'angular-ui-bootstrap.js',
      module: 'AnnoStation.AngularVendorTemplates',
      root: 'template/',
      standalone: true,
      base: template => path.basename(path.dirname(template.path)) + '/' + path.basename(template.path),
    }))
    .pipe(gulp.dest(paths.dir.distribution + '/Templates'));
});

gulp.task('build-foundation-templates', () => {
  return gulp.src(paths.dir.vendor + '/**/foundation-apps*/js/angular/components/accordion/*.html')
    .pipe($$.angularTemplateCache({
      filename: 'foundation-ui.js',
      module: 'AnnoStation.FoundationVendorTemplates',
      root: 'components/',
      standalone: true,
      base: template => path.basename(path.dirname(template.path)) + '/' + path.basename(template.path),
    }))
    .pipe(gulp.dest(paths.dir.distribution + '/Templates'));
});

gulp.task('documentation-javascript', (next) => {
  execLive('node_modules/.bin/jsdoc --configure jsdoc.conf.json', next);
});

gulp.task('documentation', (next) => {
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
  next
));
