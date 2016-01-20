import Module from '../Module';

import UsersController from './Controllers/UsersController';
import DetailController from './Controllers/DetailController';

import usersTemplate from './Views/Users.html!';
import detailTemplate from './Views/Detail.html!';

import UserGateway from './Gateways/UserGateway';
import UsersGridDirective from './Directives/UsersGridDirective';

/**
 * User Module
 *
 * @extends Module
 */
class Users extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Users', []);
    this.module.service('userGateway', UserGateway);
    //this.module.provider('bufferedHttp', BufferedHttpProvider);

    this.registerDirective('usersGrid', UsersGridDirective);
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    $stateProvider.state('labeling.users', {
      url: 'users',
      controller: UsersController,
      controllerAs: 'vm',
      template: usersTemplate,
    });

    $stateProvider.state('labeling.users-detail', {
      url: 'users/:userid',
      controller: DetailController,
      controllerAs: 'vm',
      template: detailTemplate,
    });
  }
}

Users.prototype.config.$inject = [
  '$stateProvider',
];

export default Users;
