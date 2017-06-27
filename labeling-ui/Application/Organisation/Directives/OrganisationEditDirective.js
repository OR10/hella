import OrganisationEditTemplate from './OrganisationEditDirective.html!';
import OrganisationEditController from './OrganisationEditController';

/**
 * Directive to display a list of all organisation.
 *
 */
class OrganisationEditDirective {
  constructor() {
    this.scope = {
      id: '=',
      userPermissions: '=',
    };

    this.template = OrganisationEditTemplate;
    this.controller = OrganisationEditController;

    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}

export default OrganisationEditDirective;
