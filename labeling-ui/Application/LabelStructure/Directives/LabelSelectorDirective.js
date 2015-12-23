import labelSelectorTemplate from './LabelSelectorDirective.html!';
import LabelSelectorController from './LabelSelectorController';

/**
 * @class LabelSelectorDirective
 */
export default class LabelSelectorDirective {
  constructor() {
    this.scope = {
      labeledObject: '=',
      structure: '=',
      annotation: '=',
      task: '=',
      framePosition: '=',
      isCompleted: '=?',
      labelingInstructions: '=',
    };

    this.template = labelSelectorTemplate;

    this.controller = LabelSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
