import Module from '../Module';
import ApiService from './Services/ApiService';
import AuthInterceptor from './Services/AuthInterceptor';
import RevisionManager from './Services/RevisionManager';
import BufferedHttpProvider from './Services/BufferedHttpProvider';
import EntityIdService from './Services/EntityIdService';
import AbortablePromiseFactoryProvider from './Support/AbortablePromiseFactoryProvider';

/**
 * Common Module
 *
 * @extends Module
 */
class Common extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', []);
    this.module.service('ApiService', ApiService);
    this.module.service('authInterceptor', AuthInterceptor);
    this.module.service('revisionManager', RevisionManager);
    this.module.service('entityIdService', EntityIdService);
    this.module.provider('bufferedHttp', BufferedHttpProvider);
    this.module.provider('abortablePromiseFactory', AbortablePromiseFactoryProvider);

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

export default Common;
