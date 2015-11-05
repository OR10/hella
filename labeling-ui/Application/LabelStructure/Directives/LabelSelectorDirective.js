import labelSelectorTemplate from './LabelSelectorDirective.html!';
import LabelSelectorController from './LabelSelectorController';

/**
 * @class LabelSelectorDirective
 */
export default class LabelSelectorDirective {
  constructor() {
    this.scope = {
      metaLabelingCompleted: '=',
      objectLabelingCompleted: '=',
      metaLabelStructure: '=',
      objectLabelStructure: '=',
      metaLabelAnnotation: '=',
      objectLabelAnnotation: '=',
      metaLabelContext: '=',
      objectLabelContext: '=',
      hideObjectLabels: '=',
    };

    this.template = labelSelectorTemplate;

    this.controller = LabelSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }
}
