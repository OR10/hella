/**
 * Interceptor for `$http` to be informed of all error responses
 */
class ErrorInterceptor {
  /**
   * @param {angular.Scope} $rootScope injected
   * @param {angular.$q} $q
   * @param {LoggerService} loggerService
   */
  constructor($rootScope, $q, loggerService) {
    /**
     * @type {angular.Scope}
     * @private
     */
    this._$rootScope = $rootScope;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LoggerService}
     * @private
     */
    this._logger = loggerService;

    this.responseError = this.responseError.bind(this);
  }

  /**
   * Handle errors in the response. Especially the `401` will be handled
   *
   * @param rejection
   * @returns {Promise}
   */
  responseError(rejection) {
    // Response interuption
    if (rejection.status === -1) {
      // Check if the request was deliberately aborted by the application
      if (!rejection.config.timeout || rejection.config.timeout.$$state === undefined || rejection.config.timeout.$$state.status !== 1) {
        this._logger.warn('http:interrupted', 'A http connection was interrupted/aborted', rejection);
        this._$rootScope.$broadcast('httpInterrupted');
      }
    } else if (rejection.status >= 500 && rejection.status <= 599) {
      this._logger.warn('http:servererror', 'A server error (5xx) occured upon a request', rejection);
      this._$rootScope.$broadcast('serverError', rejection.data.error);
    } else if (rejection.status >= 400 && rejection.status <= 499 && rejection.status !== 409 && rejection.status !== 406) {
      this._logger.warn('http:clienterror', 'A client error (4xx) occured upon a request', rejection);
      this._$rootScope.$broadcast('clientError', rejection.data.error);
    } else if (rejection.status === 409) {
      this._logger.warn('http:revisionerror', 'A revision mismatch (409) occured upon a request', rejection);
      this._$rootScope.$broadcast('revisionError', rejection.data.error);
    }

    return this._$q.reject(rejection);
  }
}

ErrorInterceptor.$inject = [
  '$rootScope',
  '$q',
  'loggerService',
];

export default ErrorInterceptor;
