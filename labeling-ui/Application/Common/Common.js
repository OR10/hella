import Module from '../Module';
import ApiService from './Services/ApiService';
import AuthInterceptor from './Services/AuthInterceptor';
import ReadOnlyInterceptor from './Services/ReadOnlyInterceptor';
import ErrorInterceptor from './Services/ErrorInterceptor';
import RevisionManager from './Services/RevisionManager';
import StatusGateway from './Gateways/StatusGateway';
import BufferedHttpProvider from './Services/BufferedHttpProvider';
import EntityIdService from './Services/EntityIdService';
import AbortablePromiseFactoryProvider from './Support/AbortablePromiseFactoryProvider';
import AnimationFrameService from './Services/AnimationFrameService';
import LoggerServiceProvider from './Loggers/LoggerServiceProvider';
import EntityColorService from './Services/EntityColorService';
import ModalService from './Services/ModalService';
import ReleaseConfigService from './Services/ReleaseConfigService';
import LoadingMaskDirective from './Directives/LoadingMaskDirective';
import SplitViewDirective from './Directives/SplitViewDirective';
import RightClickDirective from './Directives/RightClickDirective';
import TooltipDirective from './Directives/TooltipDirective';
import ApplicationStateProvider from './Support/ApplicationStateProvider';
import LockService from './Services/LockService';
import KeyboardShortcutService from './Services/KeyboardShortcutService';

import ConsoleLogger from './Loggers/ConsoleLogger';

import 'foundation-apps/js/angular/services/foundation.core';
import 'foundation-apps/js/angular/services/foundation.core.animation';
import 'foundation-apps/js/angular/components/common/common';
import 'foundation-apps/js/angular/components/modal/modal';

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
    this.module = angular.module('AnnoStation.Common', ['foundation.common', 'foundation.modal']);
    this.module.service('ApiService', ApiService);
    this.module.service('authInterceptor', AuthInterceptor);
    this.module.service('readOnlyInterceptor', ReadOnlyInterceptor);
    this.module.service('errorInterceptor', ErrorInterceptor);
    this.module.service('revisionManager', RevisionManager);
    this.module.service('entityIdService', EntityIdService);
    this.module.service('animationFrameService', AnimationFrameService);
    this.module.service('statusGateway', StatusGateway);
    this.module.service('entityColorService', EntityColorService);
    this.module.service('modalService', ModalService);
    this.module.service('releaseConfigService', ReleaseConfigService);
    this.module.service('lockService', LockService);
    this.module.service('keyboardShortcutService', KeyboardShortcutService);
    this.module.provider('bufferedHttp', BufferedHttpProvider);
    this.module.provider('abortablePromiseFactory', AbortablePromiseFactoryProvider);
    this.module.provider('loggerService', LoggerServiceProvider);
    this.module.provider('applicationState', ApplicationStateProvider);

    this.registerDirective('loadingMask', LoadingMaskDirective);
    this.registerDirective('splitView', SplitViewDirective);
    this.registerDirective('asRightClick', RightClickDirective);
    this.registerDirective('tooltip', TooltipDirective);

    this.module.config(
      ['$httpProvider', 'loggerServiceProvider',
        ($httpProvider, loggerServiceProvider) => {
          $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
          $httpProvider.interceptors.push('errorInterceptor');
          $httpProvider.interceptors.push('readOnlyInterceptor');
          $httpProvider.interceptors.push('authInterceptor');

          loggerServiceProvider.registerLogger(new ConsoleLogger());
          loggerServiceProvider.addContexts('*');
        },
      ]);

    this.module.run(['$rootScope', '$location', ($rootScope) => {
      $rootScope.$on('unauthorized', () => {
        const targetUrl = encodeURIComponent(window.location.pathname + window.location.hash);
        window.location.assign(`/login?targetUrl=${targetUrl}`);
      });
    }]);
  }
}

export default Common;
