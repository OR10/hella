/**
 * Interceptor for `$http` to be informed of all unauthorized responses
 */
class AuthInterceptor {
  /**
   * @param {angular.Scope} $rootScope injected
   */
  constructor($rootScope) {
    this.$rootScope = $rootScope;

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
      this.$rootScope.$emit('unauthorized', rejection.config.url);
    }

    return Promise.reject(rejection);
  }
}

AuthInterceptor.$inject = ['$rootScope'];

export default AuthInterceptor;
