/**
 * Interceptor for `$http` to be informed of all error responses
 */
class ErrorInterceptor {
  /**
   * @param {angular.Scope} $rootScope injected
   * @param {angular.$q} $q
   */
  constructor($rootScope, $q) {
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

    this.responseError = this.responseError.bind(this);
  }

  /**
   * Handle errors in the response. Especially the `401` will be handled
   *
   * @param rejection
   * @returns {Promise}
   */
  responseError(rejection) {
    if (rejection.data && rejection.data.error && rejection.data.error.type) {
      if (rejection.data.error.type === 'ReadOnlyHttpException') {
        this.$rootScope.$broadcast('readOnlyError', rejection.data.error);
      }
    }
    return this._$q.reject(rejection);
  }
}

ErrorInterceptor.$inject = [
  '$rootScope',
  '$q',
];

export default ErrorInterceptor;
