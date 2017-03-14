import 'core-js/es6/array';
import angular from 'angular';
import 'angular-ui-router';
import 'angular-animate';

import 'Distribution/Templates/foundation-ui';

import 'v-accordion';
import 'v-accordion/dist/v-accordion.css!';

import ApplicationController from './ApplicationController';
import BodyController from './BodyController';

import CommonModule from './Common/Common';
import HeaderModule from './Header/Header';
import TaskModule from './Task/TaskModule';
import ManagementBoardModule from './ManagementBoard/ManagementBoard';
import UserProfileModule from './UserProfile/UserProfile';
import FrameModule from './Frame/Frame';
import ViewerModule from './Viewer/Viewer';
import VideoModule from './Video/Video';
import LabelingDataModule from './LabelingData/LabelingData';
import LabelStructureModule from './LabelStructure/LabelStructure';
import FilmReelModule from './FilmReel/FilmReel';
import MediaControlsModule from './MediaControls/MediaControls';
import ReportingModule from './Reporting/Reporting';
import OrganisationModule from './Organisation/Organisation';

import Environment from './Common/Support/Environment';
import PouchDB from 'pouchdb';

// These imports need to be managed manually for now since jspm currently does not support
// System.import at runtime (see https://github.com/jspm/jspm-cli/issues/778).
import commonModuleConfig from './Common/config.json!';
import viewerModuleConfig from './Viewer/config.json!';
import FeatureFlags from './features.json!';

/**
 * The Main Application class
 *
 * This class bootstraps angular and initializes all modules.
 *
 * @class Application
 */
export default class Application {
  constructor() {
    this.moduleName = 'AnnoStation';

    /**
     * @type {Module[]}
     * @name Application#modules
     */
    this.modules = [];

    /**
     * @type {angular.module}
     */
    this.app = null;
  }

  /**
   * Register all the modules to be loaded by the application
   */
  registerModules() {
    this.modules.push(new OrganisationModule());
    this.modules.push(new CommonModule());
    this.modules.push(new HeaderModule());
    this.modules.push(new ManagementBoardModule());
    this.modules.push(new TaskModule());
    this.modules.push(new UserProfileModule());
    this.modules.push(new FrameModule());
    this.modules.push(new ViewerModule());
    this.modules.push(new VideoModule());
    this.modules.push(new LabelingDataModule());
    this.modules.push(new LabelStructureModule());
    this.modules.push(new FilmReelModule());
    this.modules.push(new MediaControlsModule());
    this.modules.push(new ReportingModule());
  }

  _getApplicationConfig() {
    return Promise.resolve({
      Common: commonModuleConfig,
      Viewer: viewerModuleConfig,
    });
  }

  _getFeatureFlags() {
    return Promise.resolve(
      FeatureFlags
    );
  }

  /**
   * Initializes the application by declaring and configuring modules
   */
  init() {
    this.registerModules();

    return Promise.resolve()
      .then(() => this._getFeatureFlags())
      .then(featureFlags => {
        this.modules.forEach(module => module.registerWithAngular(angular, featureFlags));

        this.app = angular.module(this.moduleName, [
          'ui.router',
          'ngAnimate',
          'AnnoStation.FoundationVendorTemplates',
          'vAccordion',
          ...this.modules.map(mod => mod.module.name),
        ]);
        this.app.constant('featureFlags', featureFlags);
        // Currently only used for handling the global loading mask
        this.app.controller('bodyController', BodyController);

        if (!Environment.isFunctionalTesting) {
          /* *****************************************************************
           * Functional tests do not setup the router
           * *****************************************************************/
          this.setupRouting();
        }

        // Allow each module to configure its angular module
        this.modules.forEach(module => module.module.config(module.config));
      })
      .then(() => this._getApplicationConfig())
      .then(applicationConfig => {
        this.app.constant('applicationConfig', applicationConfig);
        this.app.constant('PouchDB', PouchDB);
      });
  }

  /**
   * @param {HTMLElement} element
   */
  bootstrap(element) {
    Promise.resolve()
      .then(() => this.init())
      .then(() => angular.bootstrap(element, [this.moduleName], {strictDi: true}));
  }

  setupRouting() {
    function routerConfigurator($locationProvider, $stateProvider, $urlRouterProvider) {
      // do not use hashbang urls :-)
      $locationProvider.html5Mode(true);

      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise('/organisations/selection');

      // Now set up the states
      $stateProvider
        .state('labeling', {
          abstract: true,
          url: '/',
          views: {
            '@': {
              controller: ApplicationController,
              controllerAs: 'vm',
              template: '<ui-view class="grid-frame vertical"></ui-view>',
            },
          },
          resolve: {
            user: ['userGateway', userGateway => userGateway.getCurrentUser()],
            userPermissions: ['userGateway', userGateway => userGateway.getCurrentUserPermissions()],
            userOrganisations: ['userGateway', userGateway => userGateway.getCurrentUserOrganisations()],
          },
        });
    }

    routerConfigurator.$inject = [
      '$locationProvider',
      '$stateProvider',
      '$urlRouterProvider',
    ];

    this.app.config(routerConfigurator);
  }
}
