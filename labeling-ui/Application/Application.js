import angular from 'angular';
import 'angular-hotkeys';
import 'angular-ui-router';

import 'foundation-apps/js/angular/components/accordion/accordion';

import 'Distribution/Templates/angular-ui-bootstrap';
import 'Distribution/Templates/foundation-ui';

import CommonModule from './Common/Common';
import HeaderModule from './Header/Header';
import TaskModule from './Task/Task';
import HomeModule from './Home/Home';
import ExportModule from './Export/Export';
import FrameModule from './Frame/Frame';
import ViewerModule from './Viewer/Viewer';
import VideoModule from './Video/Video';
import LabelingDataModule from './LabelingData/LabelingData';
import LabelStructureModule from './LabelStructure/LabelStructure';
import FilmReelModule from './FilmReel/FilmReel';
import MediaControlsModule from './MediaControls/MediaControls';

// These imports need to be managed manually for now since jspm currently does not support
// System.import at runtime (see https://github.com/jspm/jspm-cli/issues/778).
import commonModuleConfig from './Common/config.json!';
import viewerModuleConfig from './Viewer/config.json!';

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
    this.modules.push(new CommonModule());
    this.modules.push(new HeaderModule());
    this.modules.push(new TaskModule());
    this.modules.push(new HomeModule());
    this.modules.push(new ExportModule());
    this.modules.push(new FrameModule());
    this.modules.push(new ViewerModule());
    this.modules.push(new VideoModule());
    this.modules.push(new LabelingDataModule());
    this.modules.push(new LabelStructureModule());
    this.modules.push(new FilmReelModule());
    this.modules.push(new MediaControlsModule());
  }

  buildApplicationConfig() {
    return Promise.resolve({
      Common: commonModuleConfig,
      Viewer: viewerModuleConfig,
    });
  }

  /**
   * Initializes the application by declaring and configuring modules
   */
  init() {
    this.registerModules();

    return Promise.resolve()
      .then(() => {
        this.modules.forEach((module) => module.registerWithAngular(angular));

        this.app = angular.module(this.moduleName, [
          'ui.router',
          'AnnoStation.AngularVendorTemplates',
          'AnnoStation.FoundationVendorTemplates',
          'foundation.accordion',
          ...this.modules.map(mod => mod.module.name),
        ]);

        this.setupRouting();

        return this.buildApplicationConfig();
      }).then((config) => {
        this.app.constant('applicationConfig', config);
      });
  }

  /**
   * @param {HTMLElement} element
   */
  bootstrap(element) {
    this.init().then(() => {
      angular.bootstrap(element, [this.moduleName], {strictDi: true});
    });
  }

  setupRouting() {
    function routerConfigurator($locationProvider, $stateProvider, $urlRouterProvider) {
      // do not use hashbang urls :-)
      $locationProvider.html5Mode(true);

      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise('/tasks');

      function userResolver(userGateway) {
        return userGateway.getCurrentUser().then((user) => {
          return user;
        });
      }

      userResolver.$inject = ['userGateway'];

      // Now set up the states
      $stateProvider
        .state('labeling', {
          abstract: true,
          url: '/',
          template: '<ui-view/>',
          resolve: {
            user: userResolver,
          },
        });
    }

    routerConfigurator.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

    this.app.config(routerConfigurator);

    // Allow each module to configure its angular module
    this.modules.forEach(module => module.module.config(module.config));
  }
}
