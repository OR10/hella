import OrganisationPickerTemplate from './OrganisationPickerDirective.html!';
import OrganisationPickerController from './OrganisationPickerController';

/**
 * Directive to display a combobox allowing to select the active organisation.
 *
 * A change automatically redirects to the overview page for the chosen organisation
 */
class OrganisationPickerDirective {
  constructor() {
    this.scope = {};

    this.template = OrganisationPickerTemplate;
    this.controller = OrganisationPickerController;

    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}


export default OrganisationPickerDirective;
