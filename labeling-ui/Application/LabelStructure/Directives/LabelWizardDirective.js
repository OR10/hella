import labelWizardTemplate from './LabelWizardDirective.html!';
import LabelWizardController from './LabelWizardController';

/**
 * @class LabelWizardDirective
 */
export default class LabelWizardDirective {
  constructor() {
    this.template = labelWizardTemplate;

    this.scope = {
      labelState: '=',
      labelContext: '=',
      offset: '=',
      limit: '=',
    };

    this.controller = LabelWizardController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
