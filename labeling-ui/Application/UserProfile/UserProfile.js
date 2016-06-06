import Module from '../Module';

import UserProfileController from './Controllers/UserProfileController';
import UserPasswordController from './Controllers/UserPasswordController';
import userProfileTemplate from './Views/UserProfile.html!';
import userPasswordTemplate from './Views/UserPassword.html!';
import UserGateway from '../Users/Gateways/UserGateway';

/**
 * User Module
 *
 * @extends Module
 */
class UserProfile extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.UserProfile', []);
    this.module.service('userGateway', UserGateway);
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    function userResolver(userGateway) {
      return userGateway.getCurrentUser();
    }
    userResolver.$inject = ['userGateway'];

    $stateProvider.state('labeling.userprofile', {
      url: 'user/profile',
      controller: UserProfileController,
      controllerAs: 'vm',
      template: userProfileTemplate,
      resolve: {
        user: userResolver,
      },
    });
    $stateProvider.state('labeling.userpassword', {
      url: 'user/password',
      controller: UserPasswordController,
      controllerAs: 'vm',
      template: userPasswordTemplate,
    });
  }
}

UserProfile.prototype.config.$inject = [
  '$stateProvider',
];

export default UserProfile;
