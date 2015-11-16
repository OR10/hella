import angular from 'angular';
import 'angular-hotkeys';
import 'angular-ui-router';

import 'Distribution/Templates/angular-ui-bootstrap';

import CommonModule from './Common/Common';
import TaskModule from './Task/Task';
import HomeModule from './Home/Home';
import ExportModule from './Export/Export';
import FrameModule from './Frame/Frame';
import ViewerModule from './Viewer/Viewer';
import LabelingDataModule from './LabelingData/LabelingData';
import LabelStructureModule from './LabelStructure/LabelStructure';

// These imports need to be managed manually for now since jspm currently does not support
// System.import at runtime (see https://github.com/jspm/jspm-cli/issues/778).
import commonModuleConfig from './Common/config.json!';

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
    this.modules.push(new TaskModule());
    this.modules.push(new HomeModule());
    this.modules.push(new ExportModule());
    this.modules.push(new FrameModule());
    this.modules.push(new ViewerModule());
    this.modules.push(new LabelingDataModule());
    this.modules.push(new LabelStructureModule());
  }

  buildApplicationConfig() {
    return Promise.resolve({
      Common: commonModuleConfig,
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
      $urlRouterProvider.otherwise('/');

      // Now set up the states
      // $stateProvider
      //  .state('home', {
      //    url: '/',
      //    views: {
      //      'content@': {
      //        templateUrl: 'module/home/templates/home.html'
      //
      //      }
      //    }
      //  });
    }

    routerConfigurator.$inject = ['$locationProvider', '$stateProvider', '$urlRouterProvider'];

    this.app.config(routerConfigurator);

    // Allow each module to configure its angular module
    this.modules.forEach(module => module.module.config(module.config));
  }
}
