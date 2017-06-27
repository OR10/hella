import OrganisationListTemplate from './OrganisationListDirective.html!';
import OrganisationListController from './OrganisationListController';

/**
 * Directive to display a list of all organisation.
 *
 */
class OrganisationListDirective {
  constructor() {
    this.scope = {
      userPermissions: '=',
    };

    this.template = OrganisationListTemplate;
    this.controller = OrganisationListController;

    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default OrganisationListDirective;
