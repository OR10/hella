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

  get env() {
    switch (window.__ANNOSTATION_ENVIRONMENT__) {
      case Environment.DEVELOPMENT:
      case Environment.TESTING:
        return window.__ANNOSTATION_ENVIRONMENT__;
      default:
        return Environment.PRODUCTION;
    }
  },

  get isDevelopment() {
    return this.env === Environment.DEVELOPMENT;
  },

  get isTesting() {
    return this.env === Environment.TESTING;
  },

  get isProduction() {
    return this.env === Environment.PRODUCTION;
  },
};


export default Environment;
