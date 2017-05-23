import labelSelectorTemplate from './LabelSelectorDirective.html!';
import LabelSelectorController from './LabelSelectorController';

/**
 * @class LabelSelectorDirective
 */
export default class LabelSelectorDirective {
  constructor() {
    this.scope = {
      labelStructure: '=',
      selectedLabelStructureObject: '=',
      task: '=',
      framePosition: '=',
      labelingInstructions: '=',
      readOnly: '@',
      selectedPaperShape: '=',
    };

    this.template = labelSelectorTemplate;

    this.controller = LabelSelectorController;
    this.controllerAs = 'vm';
    this.bindToController = true;
  }

  link(scope, element, attrs) {
    attrs.$observe('readOnly', () => scope.vm.readOnly = attrs.readOnly === 'true');
  }
}
