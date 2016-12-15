import UrlBuilder from '../UrlBuilder';

export function getMockRequestsMade(mock) {
  return mock.requestsMade().then(requests => {
    return requests.map(request => {
      const strippedRequest = {
        method: request.method,
        path: request.url,
      };

      if (request.data) {
        strippedRequest.data = request.data;
      }

      return strippedRequest;
    });
  });
}

export function dumpAllRequestsMade(mock) {
  return mock.allRequestsMade().then(requests => {
    const strippedRequests = requests.map(request => {
      const strippedRequest = {
        method: request.method,
        path: request.url,
      };

      if (request.data) {
        strippedRequest.data = request.data;
      }
      
      return strippedRequest;
    });

   console.log( // eslint-disable-line no-console
      `The following requests were made against the backend. Not all of them may have been mocked!\n${JSON.stringify(strippedRequests, undefined, 2)}`
    );

    // fail('Dumping all requests causes automatic test fail.');
    return Promise.reject(new Error('Dumping all requests causes automatic test fail.'));
  });
}

function waitForApplicationReady() {
  return browser.executeAsyncScript((next) => {
    window.__TEST_READY_PROMISE.then(() => next());
  });
}

const defaultTestConfig = {
  viewerWidth: 1024,
  viewerHeight: 620,
};

export function initApplication(url, testConfig = defaultTestConfig) {
  const builder = new UrlBuilder(testConfig);
  browser.get(builder.url(url));
  return waitForApplicationReady();
}

export function expectAllModalsToBeClosed() {
  const modalElements = element(by.css('.modal-overlay.is-active'));
  expect(modalElements.isPresent()).toBe(false, 'No open modal Dialog expected.');
}

export function expectModalToBePresent() {
  const modalElements = element(by.css('.modal-overlay.is-active'));
  expect(modalElements.isPresent()).toBe(true, 'Open modal Dialog expected.');
}

/**
 * Retrieve the `textContent` of a certain ElementFinder.
 *
 * This content will be filled even if the element ist not visible. In contrast to protractors `getText`.
 *
 * @returns {webdriver.promise.Promise}
 */
export function getTextContentFromElementFinder(elementFinder) {
  return elementFinder.getAttribute('textContent')
    .then(textContent => textContent.trim());
}

/**
 * Check if certain {@link ElementFinder} has got certain class set.
 *
 * @returns {webdriver.promise.Promise}
 */
export function hasClassByElementFinder(elementFinder, className) {
    return elementFinder.getAttribute('class').then(
      classString => classString.split(' ').includes(className)
    );
}
