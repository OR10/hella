/**
 * Interceptor for `$http` to be informed of all error responses
 */
class ErrorInterceptor {
  /**
   * @param {angular.Scope} $rootScope injected
   * @param {angular.$q} $q
   */
  constructor($rootScope, $q) {
    this._$rootScope = $rootScope;
    this._$q = $q;

    this.responseError = this.responseError.bind(this);
  }

  /**
   * Handle errors in the response. Especially the `401` will be handled
   *
   * @param rejection
   * @returns {Promise}
   */
  responseError(rejection) {
    if (rejection.status >= 500 && rejection.status <= 599) {
      this._$rootScope.$broadcast('serverError', rejection.data.error);
    }

    if (rejection.status >= 400 && rejection.status <= 499) {
      this._$rootScope.$broadcast('clientError', rejection.data.error);
    }

    return this._$q.reject(rejection);
  }
}

ErrorInterceptor.$inject = [
  '$rootScope',
  '$q',
];

export default ErrorInterceptor;
