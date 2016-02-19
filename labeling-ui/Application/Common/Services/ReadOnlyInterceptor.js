/**
 * Interceptor for `$http` to be informed of all error responses
 */
class ErrorInterceptor {
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
    if (rejection.data && rejection.data.error && rejection.data.error.type) {
      if (rejection.data.error.type === 'ReadOnlyHttpException') {
        this.$rootScope.$broadcast('readOnlyError', rejection.data.error);
      }
      return Promise.reject(rejection);
    }
  }
}

ErrorInterceptor.$inject = ['$rootScope'];

export default ErrorInterceptor;
