//import metaLabelStructure from 'Application/LabelStructure/Structure/meta-label-structure.json!';
//import metaLabelAnnotation from 'Application/LabelStructure/Structure/meta-label-structure-ui-annotation.json!';
//import objectLabelStructure from 'Application/LabelStructure/Structure/object-label-structure.json!';
//import objectLabelAnnotation from 'Application/LabelStructure/Structure/object-label-structure-ui-annotation.json!';

/**
 * @class LabelSelectorController
 *
 * @property {{classes: Array<string>}} labeledObject
 * @property {LabelStructure} structure
 * @property {Object} annotation
 * @property {Array<{header: string, offset: int?, limit: init?}>} sections
 */
export default class LabelSelectorController {
  constructor($scope) {
    this.firstOpen = true;

    //$scope.$watchCollection('vm.metaLabelContext', () => {
    //  this.metaLabelState = this._updateLabelState(
    //    this.metaLabelStructure,
    //    this.metaLabelContext,
    //    this.metaLabelAnnotation
    //  );
    //
    //  this.metaLabelingCompleted = this._isLabelingComplete(this.metaLabelState);
    //});

    //$scope.$watchCollection('vm.objectLabelContext', () => {
    //  this.objectLabelState = this._updateLabelState(
    //    this.objectLabelStructure,
    //    this.objectLabelContext,
    //    this.objectLabelAnnotation
    //  );
    //
    //  this.objectLabelingCompleted = this._isLabelingComplete(this.objectLabelState);
    //});
  }

  //_initializeLabelState() {
  //  this.metaLabelState = this._updateLabelState(this.metaLabelStructure, this.metaLabelContext, this.metaLabelAnnotation);
  //  this.objectLabelState = this._updateLabelState(this.objectLabelStructure, this.objectLabelContext, this.objectLabelAnnotation);
  //}

  //_updateLabelState(structure, context, annotation) {
  //  return this._annotationLabelStructureVisitor.visit(
  //    this._linearLabelStructureVisitor.visit(
  //      structure,
  //      context
  //    ),
  //    annotation
  //  );
  //}

  //_isLabelingComplete(state) {
  //  return state.children.reduce(
  //    (completeSoFar, category) => completeSoFar && category.metadata.value !== null,
  //    true
  //  );
  //}
}

LabelSelectorController.$inject = [
  '$scope',
];
