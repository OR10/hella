import {difference} from 'lodash';

class OrganisationRoutingService {
  /**
   * @param {$state} $state
   * @param {OrganisationService} organisationService
   * @param {LoggerService} logger
   */
  constructor($state, organisationService, logger) {
    /**
     * @type {$state}
     * @private
     */
    this._$state = $state;

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;

    /**
     * @type {Logger}
     * @private
     */
    this._logger = logger;
  }

  /**
   * Handler called once ui-router encounters a state change
   *
   * @param {Object} event
   * @param {Object} to
   * @param {Object} params
   */
  onStateChangeStart(event, to, params) {
    const {organisationId} = params;

    if (organisationId === undefined) {
      // Organisation id is not part of this route
      return;
    }

    if (organisationId === '' || organisationId !== this._organisationService.get()) {
      event.preventDefault();
      this._$state.go(
        to.name,
        Object.assign({}, params, {organisationId: this._organisationService.get()})
      );
    }
  }

  /**
   * Return an array of parameters which are allowed to be part of the current route, but still allow an organisation
   * change to the route, with the same parameters, but a different organisationId.
   *
   * @return {Array.<string>}
   * @private
   */
  _getWhiteListedParameters() {
    return [];
  }

  /**
   * Transistion to a new organisation based on the current $state and the new organisation
   *
   * @param {string} newOrganisationId
   */
  transistionToNewOrganisation(newOrganisationId) {
    this._organisationService.set(newOrganisationId);

    if (this._doesCurrentRouteHaveNonWhiteListedParameters()) {
      this._logger.log('organisation:routing', `Current route (${this._$state.$current.name}) does have non safe parameters for organisation change`);
      this._gotoSafePseudoParentRoute();
    } else {
      this._logger.log('organisation:routing', `Current route (${this._$state.$current.name}) is safe for organisation change`);
      this._reloadCurrentStateWithNewOrganisation();
    }
  }

  /**
   * Check if the current route does contain any parameters, which might not be safe for an organisation change
   *
   * @returns {boolean}
   * @private
   */
  _doesCurrentRouteHaveNonWhiteListedParameters() {
    const $currentState = this._$state.$current;
    const urlMatcher = $currentState.url;

    const parametersInCurrentRoute = urlMatcher.parameters();
    const allowedParameters = ['organisationId'].concat(this._getWhiteListedParameters());

    const nonAllowedParametersInCurrentRoute = difference(parametersInCurrentRoute, allowedParameters);

    return nonAllowedParametersInCurrentRoute.length !== 0;
  }

  /**
   * Transisition to the next "safe" route from the current specific route.
   *
   * A fallback is always the project overview, which should be safe in any organisation.
   *
   * @private
   */
  _gotoSafePseudoParentRoute() {
    const $currentState = this._$state.$current;
    const safeRouteName = this._getSafeRouteForRouteName($currentState.name);

    this._logger.log('organisation:routing', `Transitioning to safe route: ${safeRouteName}`);

    this._$state.go(
      safeRouteName,
      {organisationId: this._organisationService.get()}
    );
  }

  /**
   * Get a safe route name in exchange for a non safe route name
   *
   * @param {string} name
   * @returns {string}
   * @private
   */
  _getSafeRouteForRouteName(name) {
    const defaultRoute = 'labeling.projects.list';
    const safeRouteMapping = {
      'labeling.users.detail': 'labeling.users.list',
      'labeling.labeling-groups.detail': 'labeling.labeling-groups.list',
    };

    if (safeRouteMapping[name] !== undefined) {
      return safeRouteMapping[name];
    }

    return defaultRoute;
  }

  /**
   * Reload the currentstate with the new organisation
   *
   * This transisiton might be dangerous if the current route does not exist in the new organisation for the user.
   *
   * @private
   */
  _reloadCurrentStateWithNewOrganisation() {
    this._$state.reload();
  }
}

OrganisationRoutingService.$inject = [
  '$state',
  'organisationService',
  'loggerService',
];

export default OrganisationRoutingService;
