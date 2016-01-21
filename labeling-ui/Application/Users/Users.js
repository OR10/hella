import Module from '../Module';

import UsersController from './Controllers/UsersController';
import DetailController from './Controllers/DetailController';

import usersTemplate from './Views/Users.html!';
import detailTemplate from './Views/Detail.html!';

import UserGateway from './Gateways/UserGateway';
import UsersListDirective from './Directives/UsersListDirective';
import UserProfileDirective from './Directives/UserProfileDirective';
import SingleRoleFilterProvider from './Filters/SingleRoleFilterProvider';
import ReadableRoleFilterProvider from './Filters/ReadableRoleFilterProvider';

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
    this.module.filter('singleRole', SingleRoleFilterProvider);
    this.module.filter('readableRole', ReadableRoleFilterProvider);

    this.registerDirective('usersList', UsersListDirective);
    this.registerDirective('userProfile', UserProfileDirective);
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

    $stateProvider.state('labeling.user-detail', {
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
