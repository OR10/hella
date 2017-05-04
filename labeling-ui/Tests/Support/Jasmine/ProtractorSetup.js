let protractorPromise;

beforeEach(() => {
  protractorPromise = protractor.promise.defer();
});

afterEach(() => {
  protractorPromise.fulfill('ok');
  expect(protractorPromise).toBe('ok');

  // @TODO: Add pouch.destroy() to empty database after each test case
});