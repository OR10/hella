require('babel-core/register');

// We don't have SystemJS available here so we can't use 'import'
const ImageDiffReporter = require('./Tests/Support/Jasmine/Reporters/ImageDiffReporter');
const ResembleDiffReporter = require('./Tests/Support/Jasmine/Reporters/ResembleDiffReporter');
const ViewportHelper = require('./Tests/Support/Protractor/ViewportHelper');
const JasmineSpecReporter = require('jasmine-spec-reporter');
const path = require('path');

exports.config = {
  framework: 'jasmine2',
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',

  onPrepare: () => {
    require('./Tests/Support/Jasmine/CustomMatchers');
    require('jasmine-collection-matchers');

    require('protractor-http-mock').config = {
      rootDirectory: __dirname,
      protractorConfig: path.basename(__filename),
    };

    const resizeHelper = new ViewportHelper(browser);
    return resizeHelper.setViewportSize(1500, 900) // Try to be always bigger then the needed space to fit the viewer
      .then(() => {
        return browser.getCapabilities();
      })
      .then(capabilities => {
        const jasmineReporters = require('jasmine-reporters');
        const browserName = capabilities.caps_.browserName.toUpperCase();
        const browserVersion = capabilities.caps_.version;
        const platform = capabilities.caps_.platform;

        const browserIdentifier = `${platform}-${browserName}-${browserVersion}`;

        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
          consolidateAll: true,
          filePrefix: browserIdentifier + '-test-functional-results.xml',
          savePath: './Logs/Functional',
        }));

        jasmine.getEnv().addReporter(new ImageDiffReporter({
          outputDir: './Logs/Functional/Images',
          browserIdentifier: browserIdentifier,
        }));
        jasmine.getEnv().addReporter(new ResembleDiffReporter({
          outputDir: './Logs/Functional/Images',
          browserIdentifier: browserIdentifier,
        }));
        jasmine.getEnv().addReporter(new JasmineSpecReporter({
          displayStacktrace: true,
        }));
      });
  },
  jasmineNodeOpts: {
    // Disable standard 'dot' output
    print: () => {},
    defaultTimeoutInterval: 60000,
  },

  specs: ['Tests/Functional/**/*.spec.js'],
};

if (typeof process.env.PROTRACTOR_SELENIUM_GRID !== 'undefined') {
  // CI MODE
  exports.config.multiCapabilities = [
    {
      'browserName': 'chrome',
      'platform': 'WINDOWS',
    },
  ];
} else {
  exports.config.capabilities = {
    'browserName': 'chrome',
    'loggingPrefs': {
      'driver': 'INFO',
      'server': 'OFF',
      'browser': 'ALL',
    },
  };
}
