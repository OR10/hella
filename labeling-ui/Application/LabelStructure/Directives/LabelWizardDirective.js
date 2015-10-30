import labelWizardTemplate from 'LabelWizardDirective.html';
import LabelWizardController from '../Controllers/LabelWizardController';

/**
 * @class LabelWizardDirective
 */
export default class LabelWizardDirective {
  constructor() {
    this.template = labelWizardTemplate;

    this.scope = {
      labelState: '=',
    };

    this.controller = LabelWizardController
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
