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
    if (rejection.status >= 500 && rejection.status <= 599) {
      this.$rootScope.$broadcast('serverError', rejection.data.error);
    }

    if (rejection.status >= 400 && rejection.status <= 499) {
      this.$rootScope.$broadcast('clientError', rejection.data.error);
    }

    return Promise.reject(rejection);
  }
}

ErrorInterceptor.$inject = ['$rootScope'];

export default ErrorInterceptor;
