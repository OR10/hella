import Module from '../Module';

import UserProfileController from './Controllers/UserProfileController';
import UserPasswordController from './Controllers/UserPasswordController';
import userProfileTemplate from './Views/UserProfile.html!';
import userPasswordTemplate from './Views/UserPassword.html!';

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
  }

  /**
   * @inheritDoc
   */
  config($stateProvider) {
    $stateProvider.state('labeling.user', {
      url: 'user',
      redirectTo: 'labeling.user.profile',
    });

    $stateProvider.state('labeling.user.profile', {
      url: '/profile',
      views: {
        '@': {
          controller: UserProfileController,
          controllerAs: 'vm',
          template: userProfileTemplate,
          resolve: {
            user: ['userGateway',
              userGateway => userGateway.getCurrentUser(),
            ],
          },
        },
      },
    });

    $stateProvider.state('labeling.user.password', {
      url: '/password',
      views: {
        '@': {
          controller: UserPasswordController,
          controllerAs: 'vm',
          template: userPasswordTemplate,
        },
      },
    });
  }
}

UserProfile.prototype.config.$inject = [
  '$stateProvider',
];

export default UserProfile;
