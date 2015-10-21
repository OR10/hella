require('babel/register');

exports.config = {
  framework: 'jasmine2',
  mocks: {
    default: [], // default value: []
    dir: 'Tests/ProtractorMocks' // default value: 'mocks'
  },
  seleniumServerJar: './node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar',
  onPrepare: function() {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      filePrefix: 'test-e2e-results.xml',
      savePath: './Logs/E2E'
    }));

  },


  specs: ['Tests/E2E/**/*.spec.js']
};

