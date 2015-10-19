import angular from 'angular';
import 'angular-ui-router';

import Common from './Common/Common';

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
    this.modules.push(new Common());
  }

  /**
   * Initializes the application by declaring and configuring modules
   */
  init() {
    this.registerModules();

    this.modules.forEach((module) => module.registerWithAngular(angular));

    this.app = angular.module(this.moduleName, [
      'ui.router',
      ...this.modules.map(mod => mod.module.name)
    ]);

    this.setupRouting();
  }

  /**
   * @param {HTMLElement} element
   */
  bootstrap(element) {
    this.init();
    angular.bootstrap(element, [this.moduleName], {strictDi: true});
  }

  setupRouting() {
    function routerConfigurator($locationProvider, $stateProvider, $urlRouterProvider) {
      // do not use hashbang urls :-)
      $locationProvider.html5Mode(true);

      // For any unmatched url, redirect to /state1
      $urlRouterProvider.otherwise('/');

      // Now set up the states
      //$stateProvider
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
