import Module from '../Module';
import ApiService from './Services/ApiService';
import AuthInterceptor from './Services/AuthInterceptor';

export default class Common extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', []);
    this.module.service('ApiService', ApiService);
    this.module.service('authInterceptor', AuthInterceptor);


    this.module.config(['$httpProvider', ($httpProvider) => {
      $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

      $httpProvider.interceptors.push('authInterceptor');
    }]);

    this.module.run(['$rootScope', '$location', ($rootScope) => {
      $rootScope.$on('unauthorized', () => {
        const targetUrl = encodeURIComponent(window.location.pathname);
        window.location.assign(`/login?targetUrl=${targetUrl}`);
      });
    }]);
  }
}
