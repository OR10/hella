require('babel-core/register');

// We don't have SystemJS available here so we can't use 'import'
const ImageDiffReporter = require('./Tests/Support/Jasmine/Reporters/ImageDiffReporter').default;
const ResembleDiffReporter = require('./Tests/Support/Jasmine/Reporters/ResembleDiffReporter').default;
const JasmineSpecReporter = require('jasmine-spec-reporter');
const ViewportHelper = require('./Tests/Support/Protractor/ViewportHelper');
const path = require('path');
const seleniumServerJar = require("selenium-standalone-jar");

exports.config = {
  framework: 'jasmine2',
  seleniumServerJar: seleniumServerJar.path,

  onPrepare: () => {
    require('./Tests/Support/Jasmine/ProtractorSetup');
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
        const browserName = capabilities.get('browserName').toUpperCase();
        const browserVersion = capabilities.get('version');
        const platform = capabilities.get('platform');

        const browserIdentifier = `${platform}-${browserName}-${browserVersion}`;

        jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
          consolidateAll: true,
          filePrefix: browserIdentifier + '-test-e2e-results.xml',
          savePath: './Logs/E2E',
        }));

        jasmine.getEnv().addReporter(new ImageDiffReporter({
          outputDir: './Logs/E2E/Images',
          browserIdentifier: browserIdentifier,
        }));
        jasmine.getEnv().addReporter(new ResembleDiffReporter({
          outputDir: './Logs/E2E/Images',
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

  plugins: [{
    package: 'protractor-console',
    logLevels: ['severe', 'warning', 'info', 'debug'],
  }],

  specs: ['Tests/E2E/**/*.spec.js'],
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
    'chromeOptions': {
      'binary': '/Applications/Chromium.app/Contents/MacOS/Chromium',
    },
  };

  if (process.env.HEADLESS === 'true') {
    exports.config.capabilities.chromeOptions.args = [ "--headless", "--window-size=1920,1080" ];
  }
}
