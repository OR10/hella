/**
 * Interceptor for `$http` to be informed of all unauthorized responses
 */
class AuthInterceptor {
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
    if (rejection.status === 401) {
      this._$rootScope.$emit('unauthorized', rejection.config.url);
    }

    return this._$q.reject(rejection);
  }
}

AuthInterceptor.$inject = [
  '$rootScope',
  '$q',
];

export default AuthInterceptor;
