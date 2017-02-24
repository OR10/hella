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
    console.log('Application controller construct!');
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
      organisationService.set(userOrganisations[0]);
    }

    this._deregisterStateChangeListener = $scope.$root.$on(
      '$stateChangeStart',
      (event, to, params) => {
        console.log('$stateChangeStart!');
        const {organisationId} = params;
        console.log('event', event);
        console.log('to', to);
        console.log('params', params);

        if (organisationId === undefined || organisationId !== organisationService.get().id) {
          console.log('inject organisation', organisationService.get());
          event.preventDefault();
          $state.go(
            to.name,
            Object.assign({}, params, {organisationId: organisationService.get().id}),
            {location: 'replace'}
          );
        }
      }
    );

    $scope.$on('$destroy', () => {
      console.log('deregistering StateChangeListener');
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
