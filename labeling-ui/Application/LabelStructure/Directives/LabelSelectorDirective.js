import labelSelectorTemplate from './LabelSelectorDirective.html!';
import LabelSelectorController from '../Controllers/LabelSelectorController';

/**
 * @class LabelSelectorDirective
 */
export default class LabelSelectorDirective {
  constructor() {
    this.scope = {
      metaLabelStructure: '=',
      objectLabelStructure: '=',
      metaLabelAnnotation: '=',
      objectLabelAnnotation: '=',
    };

    this.template = labelSelectorTemplate;

    this.controller = LabelSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
