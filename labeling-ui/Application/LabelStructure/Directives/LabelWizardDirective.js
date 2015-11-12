import labelWizardTemplate from './LabelWizardDirective.html!';
import LabelWizardController from './LabelWizardController';

/**
 * @class LabelWizardDirective
 */
export default class LabelWizardDirective {
  constructor() {
    this.template = labelWizardTemplate;

    this.scope = {
      pages: '=',
      choices: '=',
      offset: '@',
      limit: '@',
    };

    this.controller = LabelWizardController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
