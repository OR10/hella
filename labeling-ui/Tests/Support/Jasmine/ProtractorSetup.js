let protractorPromise;

beforeEach(() => {
  // browser.wait(() => {
  //   return browser.executeScript('return !!window.angular');
  // });

  protractorPromise = protractor.promise.defer();
});

afterEach(() => {
  protractorPromise.fulfill('ok');
  expect(protractorPromise).toBe('ok');
});