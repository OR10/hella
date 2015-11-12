//import metaLabelStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
//import metaLabelAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
//import objectLabelStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
//import objectLabelAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

/**
 * @class LabelSelectorController
 *
 * @property {string} labeledObjectType
 * @property {{classes: Array<string>}} labeledObject
 * @property {LabelStructure} structure
 * @property {Object} annotation
 * @property {Array<{header: string, offset: int?, limit: init?}>} sections
 */
export default class LabelSelectorController {
  constructor($scope) {
    this.firstOpen = true;
  }
}

LabelSelectorController.$inject = [
  '$scope',
];
