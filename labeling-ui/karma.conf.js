// Karma configuration
var ip = require('ip');

module.exports = function(config) {
  var newConfig = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // This is not an officially documented config. I found this somewhere on the web.
    // If there are strange timeout problems, this might be the place to start debugging.
    //browserNoActivityTimeout: 120000,

    captureTimeout: 20000,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jspm', 'jasmine'],

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['junit', 'progress', 'verbose', 'coverage'],
    junitReporter: {
      outputFile: 'test-unit-results.xml'
    },

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,
    autoWatch: false,

    colors: true,

    files: [
      //'.workaround/jquery.js',
      //'.workaround/angular.js',
      //'tests/fixtures/**/*',
      //'app/**/*.html'
    ],

    jspm: {
      config: 'Application/system.config.js',
      loadFiles: ['Tests/unit/**/*.spec.js'],
      serveFiles: [
        'Application/**/*.js',
        'Application/**/*.css'
      ],
      urlRoot: '/',
      meta: {
        'Tests/unit/*': { format: 'register' }
      }
    },

    proxies: {
    //  '/base/scripts/tests': '/base/tests',
    //  '/base/scripts': '/base/app/scripts',
    //  '/base/module': '/base/app/module',
    //  '/base/vendor': '/base/app/vendor',
      '/base/vendor': '/base/Application/vendor'
    },

    // list of files to exclude
    exclude: [],

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_WARN,

    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'app/',
      prependPrefix: '/'
    },


    babelPreprocessor: {
      options: {
        modules: "system"
      }
    },

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'Tests/fixtures/**/*.json': ['json2js'],
      'Application/**/*.html': ['ng-html2js'],
      'Tests/unit/**/*.spec.js': ['babel', 'coverage']
    },

    // optionally, configure the reporter
    coverageReporter: {
      type: 'html',
      dir: 'coverage/'
    }
  };

  if (typeof process.env.KARMA_SELENIUM_GRID !== 'undefined') {
    // CI MODE
    var webdriverConfig = {
      hostname: process.env.KARMA_SELENIUM_GRID,
      port: 4444
    };

    newConfig.hostname = ip.address();
    newConfig.browsers = ['Chrome'];
    newConfig.customLaunchers = {
      'Safari': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'safari',
        platform: 'MAC',
        name: 'Karma'
      },
      'Chrome': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'chrome',
        platform: 'LINUX',
        name: 'Karma'
      },
      'IE11': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'internet explorer',
        version: '11',
        name: 'Karma'
      },
      'FF36': {
        base: 'WebDriver',
        config: webdriverConfig,
        browserName: 'firefox',
        version: '36',
        name: 'Karma'
      }
    };

    console.log('Expecting tests to be accessible under ' + ip.address()); // my ip address
  } else {
    // NORMAL MODE
    newConfig.browsers = ['Chrome'];
  }

  config.set(newConfig);
};
