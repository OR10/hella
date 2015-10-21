import mock from 'protractor-http-mock';

describe('VideoList', () => {
  beforeEach(() => {
    mock(['VideoList/Dummy'])
  });

  it('should pass', () => {
    browser.get('/');

    expect(1).toBe(1);
  });
});