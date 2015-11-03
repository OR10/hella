require('babel/register');

exports.config = {
  framework: 'jasmine2',
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',
  onPrepare: function() {
    const jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      filePrefix: 'test-e2e-results.xml',
      savePath: './Logs/E2E',
    }));
  },
  specs: ['Tests/E2E/**/*.spec.js'],
};

