/**
 * @class AuthInterceptor
 */
export default class AuthInterceptor {
  constructor($rootScope) {
    this.$rootScope = $rootScope;

    this.responseError = this.responseError.bind(this);
  }

  responseError(rejection) {
    if (rejection.status === 401) {
      this.$rootScope.$emit('unauthorized', rejection.config.url);
    }

    return Promise.reject(rejection);
  }
}

AuthInterceptor.$inject = ['$rootScope'];
