import url from 'url';
import selenium_webdriver from 'selenium-webdriver';
import clientSideScripts from 'protractor/built/clientsidescripts';

import {Command, Name as CommandName} from  'selenium-webdriver/lib/command';

const DEFER_LABEL = 'NG_DEFER_BOOTSTRAP!';

export default class ExtendedBrowser {
  /**
   * @param {ProtractorBrowser} browser
   */
  constructor(browser) {
    this._browser = browser;
  }

 executeScriptWithDescription(script, description) {
    var scriptArgs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      scriptArgs[_i - 2] = arguments[_i];
    }
    if (typeof script === 'function') {
      script = 'return (' + script + ').apply(null, arguments);';
    }
    return this._browser.driver.schedule(new Command(CommandName.EXECUTE_SCRIPT)
      .setParameter('script', script)
      .setParameter('args', scriptArgs), description);
  };

  /**
   * This is more or less a copy of `ProtractorBrowser.prototype.get`, which allows for a custom bootstrapping phase.
   *
   * @param {string} destination Destination URL.
   * @param {number=} timeout Number of milliseconds to wait for Angular to
   *     start.
   * @param {Function} customBootstrap
   */
  getWithCustomBootstrap(destination, timeout, customBootstrap) {
    const self = this;
    const customBootstrapArgs = Array.prototype.slice.call(arguments, 3);
    if (timeout === void 0) {
      timeout = self._browser.getPageTimeout;
    }
    destination = self._browser.baseUrl.indexOf('file://') === 0
      ? self._browser.baseUrl + destination
      : url.resolve(self._browser.baseUrl, destination);
    const msg = function (str) {
      return 'Protractor.get(' + destination + ') - ' + str;
    };
    const deferred = selenium_webdriver.promise.defer();
    self._browser.driver.get(self._browser.resetUrl).then(null, deferred.reject);
    self._browser.executeScript('window.name = "' + DEFER_LABEL + '" + window.name;' +
      'window.location.replace("' + destination + '");', msg('reset url'))
      .then(null, deferred.reject);
    // We need to make sure the new url has loaded before
    // we try to execute any asynchronous scripts.
    self._browser.driver
      .wait(function () {
        return self
          .executeScriptWithDescription('return window.location.href;', msg('get url'))
          .then(function (url) {
            return url !== self._browser.resetUrl;
          }, function (err) {
            if (err.code == 13) {
              // Ignore the error, and continue trying. This is
              // because IE driver sometimes (~1%) will throw an
              // unknown error from this execution. See
              // https://github.com/angular/protractor/issues/841
              // This shouldn't mask errors because it will fail
              // with the timeout anyway.
              return false;
            }
            else {
              throw err;
            }
          });
      }, timeout, 'waiting for page to load for ' + timeout + 'ms')
      .then(null, deferred.reject);
    self._browser.driver.controlFlow().execute(function () {
      return self._browser.plugins_.onPageLoad();
    });
    // Make sure the page is an Angular page.
    self._browser.executeAsyncScript_(clientSideScripts.testForAngular, msg('test for angular'), Math.floor(timeout / 1000), self._browser.ng12Hybrid)
      .then(function (angularTestResult) {
        var angularVersion = angularTestResult.ver;
        if (!angularVersion) {
          throw new Error('Angular could not be found on the page ' + destination + '. If this is not an ' +
            'Angular application, you may need to turn off waiting for Angular. Please ' +
            'see https://github.com/angular/protractor/blob/master/docs/timeouts.md#waiting-for-angular-on-page-load');
        }
        return angularVersion;
      }, function (err) {
        throw new Error('Error while running testForAngular: ' + err.message);
      })
      .then(loadMocks, deferred.reject);

    function loadMocks(angularVersion) {
      if (angularVersion === 1) {
        // At this point, Angular will pause for us until angular.resumeBootstrap is called.
        var moduleNames = [];
        var _loop_1 = function (name_1, script, args) {
          moduleNames.push(name_1);
          var executeScriptArgs = [script, msg('add mock module ' + name_1)].concat(args);
          self.executeScriptWithDescription.apply(self, executeScriptArgs)
            .then(null, function (err) {
              throw new Error('Error while running module script ' + name_1 + ': ' + err.message);
            })
            .then(null, deferred.reject);
        };
        for (var _i = 0, _a = self._browser.mockModules_; _i < _a.length; _i++) {
          var _b = _a[_i], name_1 = _b.name, script = _b.script, args = _b.args;
          _loop_1(name_1, script, args);
        }
        self._browser.executeAsyncScript_.apply(self._browser, [customBootstrap, msg('custom bootstrap')].concat(customBootstrapArgs))
          .then(null, deferred.reject);
        self.executeScriptWithDescription('angular.resumeBootstrap(arguments[0]);', msg('resume bootstrap'), moduleNames)
          .then(null, deferred.reject);
      }
      else {
        // TODO: support mock modules in Angular2. For now, error if someone
        // has tried to use one.
        if (self._browser.mockModules_.length > 1) {
          deferred.reject('Trying to load mock modules on an Angular2 app ' +
            'is not yet supported.');
        }
      }
    }

    self._browser.driver.controlFlow().execute(function () {
      return self._browser.plugins_.onPageStable().then(function () {
        deferred.fulfill();
      }, deferred.reject);
    });
    return deferred.promise;
  };
}
