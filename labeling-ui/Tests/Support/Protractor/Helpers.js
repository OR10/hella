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
