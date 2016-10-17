/**
 * Abstraction to retrieve the environment the application is currently in.
 *
 * Valid environments are:
 *
 * - `dev`
 * - `test`
 * - `prod`
 */
const Environment = {
  DEVELOPMENT: 'dev',
  TESTING: 'test',
  PRODUCTION: 'prod',
  FUNCTIONAL_TESTING: 'test-functional',

  get env() {
    switch (window.__ANNOSTATION_ENVIRONMENT__) {
      case Environment.DEVELOPMENT:
      case Environment.TESTING:
      case Environment.FUNCTIONAL_TESTING:
        return window.__ANNOSTATION_ENVIRONMENT__;
      default:
        return Environment.PRODUCTION;
    }
  },

  get isDevelopment() {
    return this.env === Environment.DEVELOPMENT;
  },

  get isTesting() {
    return this.env === Environment.TESTING || this.env === Environment.FUNCTIONAL_TESTING;
  },

  get isFunctionalTesting() {
    return this.env === Environment.FUNCTIONAL_TESTING;
  },

  get isProduction() {
    return this.env === Environment.PRODUCTION;
  },
};


export default Environment;
