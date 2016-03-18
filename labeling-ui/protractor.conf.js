require('babel-core/register');

// We don't have SystemJS available here so we can't use 'import'
const ImageDiffReporter = require('./Tests/Support/Jasmine/ImageDiffReporter/ImageDiffReporter');
const ViewportResizeHelper = require('./Tests/Support/Protractor/ViewportResizeHelper');

exports.config = {
  framework: 'jasmine2',
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',

  onPrepare: () => {
    require('./Tests/Support/Jasmine/CustomMatchers');
    require('jasmine-collection-matchers');

    const resizeHelper = new ViewportResizeHelper(browser);
    return resizeHelper.setViewportSize(640, 480)
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
          filePrefix: browserIdentifier + '-test-e2e-results.xml',
          savePath: './Logs/E2E',
        }));

        jasmine.getEnv().addReporter(new ImageDiffReporter({
          outputDir: './Logs/E2E/Images',
          browserIdentifier: browserIdentifier,
        }));
      });
  },

  specs: ['Tests/E2E/**/*.spec.js'],
  mocks: {
    dir: 'Tests/ProtractorMocks'
  },
};

if (typeof process.env.PROTRACTOR_SELENIUM_GRID !== 'undefined') {
  // CI MODE
  exports.config.multiCapabilities = [
    {
      'browserName': 'chrome',
      'chromeOptions': {
        //'mobileEmulation': {
        //  'deviceName': 'Laptop with MDPI screen',
        //},
      }
    },
    {
      'browserName': 'firefox',
    },
  ];
} else {
  exports.config.capabilities = {
    'browserName': 'chrome',
    'chromeOptions': {
      //'mobileEmulation': {
      //  'deviceName': 'Laptop with MDPI screen',
      //},
    },
  };
}
