import Environment from './Common/Support/Environment';
import RemoteLogger from './Common/Loggers/RemoteLogger';

class ApplicationController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$location} $location
   * @param {LoggerService} loggerService
   * @param {LogGateway} logGateway
   * @param {CurrentUserService} currentUserService
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Array.<Organisation>} userOrganisations
   */
  constructor($scope, $location, loggerService, logGateway, currentUserService, user, userPermissions, userOrganisations) {
    // /**
    //  * @type {angular.Scope}
    //  * @private
    //  */
    // this._$scope = $scope;
    //
    // /**
    //  * @type {angular.$location}
    //  * @private
    //  */
    // this._$location = $location;

    // Set active user information for usage throughout the application
    currentUserService.set(user);
    currentUserService.setPermissions(userPermissions);
    currentUserService.setOrganisations(userOrganisations);

    if (!Environment.isDevelopment && !Environment.isTesting && !Environment.isFunctionalTesting) {
      loggerService.addLogger(new RemoteLogger(logGateway, user));
    }
  }
}

ApplicationController.$inject = [
  '$scope',
  '$location',
  'loggerService',
  'logGateway',
  'currentUserService',
  'user',
  'userPermissions',
  'userOrganisations',
];

export default ApplicationController;
