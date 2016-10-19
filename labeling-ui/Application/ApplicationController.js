import Environment from './Common/Support/Environment';
import RemoteLogger from './Common/Loggers/RemoteLogger';

class ApplicationController {
  /**
   * @param {angular.Scope} $scope
   * @param {angular.$location} $location
   * @param {LoggerService} loggerService
   * @param {LogGateway} logGateway
   * @param {User} user
   */
  constructor($scope, $location, loggerService, logGateway, user) {
    /**
     * @type {angular.Scope}
     * @private
     */
    this._$scope = $scope;

    this._$location = $location;

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
  'user',
];

export default ApplicationController;
