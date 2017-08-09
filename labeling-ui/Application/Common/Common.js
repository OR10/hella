/**
 * Common Module
 *
 * @extends Module
 */
import Module from '../Module';
import Environment from './Support/Environment';
import ApiService from './Services/ApiService';
import CurrentUserService from './Services/CurrentUserService';
import AuthInterceptor from './Services/AuthInterceptor';
import ReadOnlyInterceptor from './Services/ReadOnlyInterceptor';
import ErrorInterceptor from './Services/ErrorInterceptor';
import RevisionManager from './Services/RevisionManager';
import StatusGateway from './Gateways/StatusGateway';
import LogGateway from './Gateways/LogGateway';
import BufferedHttpProvider from './Services/BufferedHttpProvider';
import EntityIdService from './Services/EntityIdService';
import AbortablePromiseFactoryProvider from './Support/AbortablePromiseFactoryProvider';
import AnimationFrameService from './Services/AnimationFrameService';
import LoggerServiceProvider from './Loggers/LoggerServiceProvider';
import EntityColorService from './Services/EntityColorService';
import ModalService from './Services/ModalService';
import ReleaseConfigService from './Services/ReleaseConfigService';
import LoadingMaskDirective from './Directives/LoadingMaskDirective';
import RibbonDirective from './Directives/RibbonDirective';
import IdleIndicatorDirective from './Directives/IdleIndicatorDirective';
import SplitViewDirective from './Directives/SplitViewDirective';
import RightClickDirective from './Directives/RightClickDirective';
import TooltipDirective from './Directives/TooltipDirective';
import FileModelDirective from './Directives/FileModelDirective';
import ApplicationStateProvider from './Support/ApplicationStateProvider';
import LockService from './Services/LockService';
import KeyboardShortcutService from './Services/KeyboardShortcutService';
import ApplicationLoadingMaskService from './Services/ApplicationLoadingMaskService';
import ApplicationLoadingMaskStateService from './Services/ApplicationLoadingMaskStateService';
import InProgressService from './Services/InProgressService';
import PouchDbViewService from './Services/PouchDbViewService';
import SideNavigationDirective from './Directives/SideNavigationDirective';
import UserAvatarDirective from './Directives/UserAvatarDirective';
import PageTitleDirective from './Directives/PageTitleDirective';
import PiePercentageDirective from './Directives/PiePercentageDirective';

import PouchDbLiveMigration from './Services/PouchDbLiveMigration';
import PouchDbContextService from './Services/PouchDbContextService';
import PouchDbSyncManager from './Services/PouchDbSyncManager';
import PouchDbSyncManagerMock from 'Tests/Support/PouchDb/PouchDbSyncManager';
import PouchDbViewHeater from './Services/PouchDbViewHeater';

import DebouncerService from './Services/DebouncerService';
import CouchDbModelSerializer from './Services/CouchDbModelSerializer';
import CouchDbModelDeserializer from './Services/CouchDbModelDeserializer';

import PackagingExecutor from './Services/PackagingExecutor';
import ConfigurableAssemblyFactory from './Services/PackagingExecutor/ConfigurableAssemblyFactory';
import SimpleAssemblyStrategy from './Services/PackagingExecutor/SimpleAssemblyStrategy';
import AssemblyJobFactory from './Services/PackagingExecutor/AssemblyJobFactory';
import ReplicationStateService from './Services/ReplicationStateService';
import TaskReplicationService from './Services/TaskReplicationService';
import ShapeSelectionService from './Services/ShapeSelectionService';

import modalDialogProvider from './Services/ModalDialogs/ModalDialog';
import infoDialogProvider from './Services/ModalDialogs/InfoDialog';
import inputDialogProvider from './Services/ModalDialogs/InputDialog';
import listDialogProvider from './Services/ModalDialogs/ListDialog';
import selectionDialogProvider from './Services/ModalDialogs/SelectionDialog';

import ConsoleLogger from './Loggers/ConsoleLogger';

import hotkeysTemplate from './Views/hotkeysTemplate.html!';

import 'foundation-apps/js/angular/services/foundation.core';
import 'foundation-apps/js/angular/services/foundation.core.animation';
import 'foundation-apps/js/angular/components/common/common';
import 'foundation-apps/js/angular/components/modal/modal';

import 'angular-ui-router';
import 'flowjs/dist/flow.js';
import 'ng-flow/dist/ng-flow';
import 'angular-hotkeys';

class Common extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', [
      'foundation.common',
      'foundation.modal',
      'ui.router',
      'flow',
      'cfp.hotkeys',
    ]);
    this.module.service('ApiService', ApiService);
    this.module.service('currentUserService', CurrentUserService);
    this.module.service('authInterceptor', AuthInterceptor);
    this.module.service('readOnlyInterceptor', ReadOnlyInterceptor);
    this.module.service('errorInterceptor', ErrorInterceptor);
    this.module.service('revisionManager', RevisionManager);
    this.module.service('entityIdService', EntityIdService);
    this.module.service('animationFrameService', AnimationFrameService);
    this.module.service('statusGateway', StatusGateway);
    this.module.service('logGateway', LogGateway);
    this.module.service('entityColorService', EntityColorService);
    this.module.service('modalService', ModalService);
    this.module.service('releaseConfigService', ReleaseConfigService);
    this.module.service('lockService', LockService);
    this.module.service('keyboardShortcutService', KeyboardShortcutService);
    this.module.service('applicationLoadingMaskService', ApplicationLoadingMaskService);
    this.module.service('applicationLoadingMaskStateService', ApplicationLoadingMaskStateService);
    this.module.service('inProgressService', InProgressService);
    this.module.service('pouchDbViewService', PouchDbViewService);

    this.module.service('pouchDbLiveMigration', PouchDbLiveMigration);
    this.module.service('pouchDbContextService', PouchDbContextService);
    this.module.service('pouchDbViewHeater', PouchDbViewHeater);

    if (Environment.isTesting) {
      this.module.service('pouchDbSyncManager', PouchDbSyncManagerMock);
    } else {
      this.module.service('pouchDbSyncManager', PouchDbSyncManager);
    }

    this.module.service('debouncerService', DebouncerService);
    this.module.service('couchDbModelSerializer', CouchDbModelSerializer);
    this.module.service('couchDbModelDeserializer', CouchDbModelDeserializer);

    this.module.service('packagingExecutor', PackagingExecutor);
    this.module.service('assemblyFactory', ConfigurableAssemblyFactory);
    this.module.service('assemblyStrategy', SimpleAssemblyStrategy);
    this.module.service('assemblyJobFactory', AssemblyJobFactory);
    this.module.service('replicationStateService', ReplicationStateService);
    this.module.service('taskReplicationService', TaskReplicationService);
    this.module.service('shapeSelectionService', ShapeSelectionService);

    this.module.provider('bufferedHttp', BufferedHttpProvider);
    this.module.provider('abortablePromiseFactory', AbortablePromiseFactoryProvider);
    this.module.provider('loggerService', LoggerServiceProvider);
    this.module.provider('applicationState', ApplicationStateProvider);

    this.module.factory('ModalDialog', modalDialogProvider);
    this.module.factory('InfoDialog', infoDialogProvider);
    this.module.factory('InputDialog', inputDialogProvider);
    this.module.factory('ListDialog', listDialogProvider);
    this.module.factory('SelectionDialog', selectionDialogProvider);

    this.registerDirective('loadingMask', LoadingMaskDirective);
    this.registerDirective('ribbon', RibbonDirective);
    this.registerDirective('idleIndicator', IdleIndicatorDirective);
    this.registerDirective('splitView', SplitViewDirective);
    this.registerDirective('asRightClick', RightClickDirective);
    this.registerDirective('tooltip', TooltipDirective);
    this.registerDirective('fileModel', FileModelDirective);
    this.registerDirective('sideNavigation', SideNavigationDirective);
    this.registerDirective('userAvatar', UserAvatarDirective);
    this.registerDirective('pageTitle', PageTitleDirective);
    this.registerDirective('piePercentage', PiePercentageDirective);

    this.module.config(
      ['$compileProvider', '$httpProvider', 'hotkeysProvider', 'loggerServiceProvider',
        ($compileProvider, $httpProvider, hotkeysProvider, loggerServiceProvider) => {
          if (Environment.isProduction) {
            $compileProvider.debugInfoEnabled(false);
          }

          $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
          $httpProvider.interceptors.push('errorInterceptor');
          $httpProvider.interceptors.push('readOnlyInterceptor');
          $httpProvider.interceptors.push('authInterceptor');

          hotkeysProvider.template = hotkeysTemplate;
          hotkeysProvider.templateTitle = 'Active Keyboard Shortcuts:';

          loggerServiceProvider.registerLogger(new ConsoleLogger());

          loggerServiceProvider.addContexts('bufferedHttp:revisionManager');
          loggerServiceProvider.addContexts('http:*');

          if (Environment.isDevelopment) {
            loggerServiceProvider.addContexts('*');
          }
        },
      ]);

    this.module.run(['$rootScope', '$state', '$location', 'modalService', 'inProgressService', ($rootScope, $state, $location, modalService, inProgressService) => {
      $rootScope.$on('readOnlyError', () => {
        modalService.info(
          {
            title: 'Read only',
            headline: 'This task is read only',
            message: 'This task is marked as read only. This is either because of the tasks being marked as finished or because of the task being worked on by another person. You are not allowed to make any changes!',
            confirmButtonText: 'Reload page',
          },
          () => window.location.reload(),
          undefined,
          {
            abortable: false,
            warning: true,
          }
        );
      });

      $rootScope.$on('serverError', () => {
        modalService.info(
          {
            title: 'Server Error (5xx)',
            headline: 'There was an error with the application!',
            message: 'Please reload the page or go back to the main page.',
            confirmButtonText: 'Go to main page',
            cancelButtonText: 'Reload page',
          },
          () => $location.path('/'),
          () => window.location.reload(),
          {
            warning: true,
          }
        );
      });

      $rootScope.$on('clientError', () => {
        modalService.info(
          {
            title: 'Client Error (4xx)',
            headline: 'There was an error with the application!',
            message: 'Please reload the page or go back to the main page.',
            confirmButtonText: 'Go to main page',
            cancelButtonText: 'Reload page',
          },
          () => $location.path('/'),
          () => window.location.reload(),
          {
            warning: true,
          }
        );
      });

      $rootScope.$on('revisionError', () => {
        modalService.info(
          {
            title: 'Revision Error (409)',
            headline: 'There was an error with the application!',
            message: 'Please reload the page and contact your label coordinator about this error.',
            confirmButtonText: 'Reload Page',
          },
          () => window.location.reload(),
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
      });

      $rootScope.$on('httpInterrupted', () => {
        modalService.info(
          {
            title: 'Http Connection Error',
            headline: 'There was an error with the application!',
            message: 'Please reload the page and contact your label coordinator about this error.',
            confirmButtonText: 'Reload Page',
          },
          () => window.location.reload(),
          undefined,
          {
            warning: true,
            abortable: false,
          }
        );
      });

      $rootScope.$on('unauthorized', () => {
        const targetUrl = encodeURIComponent(window.location.pathname + window.location.hash);
        window.location.assign(`/login?targetUrl=${targetUrl}`);
      });

      $rootScope.$on('$stateChangeStart', (event, to, params) => {
        if (to.redirectTo && inProgressService.noActiveNavigationInterceptor()) {
          event.preventDefault();
          $state.go(to.redirectTo, params, {location: 'replace'});
        }
      });
    }]);
  }
}

export default Common;
