import Environment from './Common/Support/Environment';
import RemoteLogger from './Common/Loggers/RemoteLogger';

class ApplicationController {
  /**
   * @param {$scope} $scope
   * @param {$state} $state
   * @param {LoggerService} loggerService
   * @param {LogGateway} logGateway
   * @param {CurrentUserService} currentUserService
   * @param {OrganisationService} organisationService
   * @param {User} user
   * @param {Object} userPermissions
   * @param {Array.<Organisation>} userOrganisations
   */
  constructor($scope, $state, loggerService, logGateway, currentUserService, organisationService, user, userPermissions, userOrganisations) {
    /**
     * @type {CurrentUserService}
     * @private
     */
    this._currentUserService = currentUserService;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

    // Set active user information for usage throughout the application
    currentUserService.set(user);
    currentUserService.setPermissions(userPermissions);
    currentUserService.setOrganisations(userOrganisations);

    // Initialize Organisation with the first one of the user, by default
    if (organisationService.get() === null) {
      organisationService.set(userOrganisations[0].id);
    }

    this._deregisterStateChangeListener = $scope.$root.$on(
      '$stateChangeStart',
      (event, to, params) => {
        const {organisationId} = params;

        if (organisationId === undefined) {
        // Organisation id is not part of this route
          return;
        }

        if (organisationId === '' || organisationId !== organisationService.get()) {
          event.preventDefault();
          $state.go(
            to.name,
            Object.assign({}, params, {organisationId: organisationService.get()})
          );
        }
      }
    );

    $scope.$on('$destroy', () => {
      this._deregisterStateChangeListener();
    });

    if (!Environment.isDevelopment && !Environment.isTesting && !Environment.isFunctionalTesting) {
      loggerService.addLogger(new RemoteLogger(logGateway, user));
    }
  }

}

ApplicationController.$inject = [
  '$scope',
  '$state',
  'loggerService',
  'logGateway',
  'currentUserService',
  'organisationService',
  'user',
  'userPermissions',
  'userOrganisations',
];

export default ApplicationController;
