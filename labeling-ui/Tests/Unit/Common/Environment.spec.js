import Environment from 'Application/Common/Support/Environment';

describe('Environment', () => {
  let savedEnvironment;

  beforeEach(() => {
    savedEnvironment = window.__ANNOSTATION_ENVIRONMENT__;
  });

  it('should have test environment during test runs', () => {
    expect(Environment.isTesting).toBeTruthy();
  });

  using([
    ['test', 'test', ['isTesting'], ['isDevelopment', 'isProduction']],
    ['prod', 'prod', ['isProduction'], ['isTesting', 'isDevelopment']],
    ['dev', 'dev', ['isDevelopment'], ['isTesting', 'isProduction']],
    [undefined, 'prod', ['isProduction'], ['isDevelopment', 'isTesting']],
    ['foobar', 'prod', ['isProduction'], ['isDevelopment', 'isTesting']],
  ], (environment, expected, trueShortcuts, falseShortcuts) => {
    it('should return correct environment', () => {
      window.__ANNOSTATION_ENVIRONMENT__ = environment;
      expect(Environment.env).toBe(expected);
    });

    it('should return true for specific shortcut(s)', () => {
      window.__ANNOSTATION_ENVIRONMENT__ = environment;
      trueShortcuts.forEach(
        shortcut => expect(Environment[shortcut]).toBeTruthy()
      );
    });

    it('should return false for specific shortcut(s)', () => {
      window.__ANNOSTATION_ENVIRONMENT__ = environment;
      falseShortcuts.forEach(
        shortcut => expect(Environment[shortcut]).toBeFalsy()
      );
    });
  });

  afterEach(() => {
    window.__ANNOSTATION_ENVIRONMENT__ = savedEnvironment;
  });
});
