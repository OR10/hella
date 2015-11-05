/**
 * @class LabelSelectorController
 *
 * @property {Object} metaLabelAnnotation
 * @property {Object} objectLabelAnnotation
 * @property {Object} metaLabelStructure
 * @property {Object} objectLabelStructure
 * @property {Object} metaLabelContext
 * @property {Object} objectLabelContext
 * @property {Boolean} metaLabelingCompleted
 * @property {Boolean} objectLabelingCompleted
 */
export default class LabelSelectorController {
  constructor($scope, annotationLabelStructureVisitor, linearLabelStructureVisitor) {
    this._annotationLabelStructureVisitor = annotationLabelStructureVisitor;
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    this.firstOpen = true;

    this._initializeLabelState();

    $scope.$watchCollection('vm.metaLabelContext', () => {
      this.metaLabelState = this._updateLabelState(
        this.metaLabelStructure,
        this.metaLabelContext,
        this.metaLabelAnnotation
      );

      this.metaLabelingCompleted = this._isLabelingComplete(this.metaLabelState);
    });

    $scope.$watchCollection('vm.objectLabelContext', () => {
      this.objectLabelState = this._updateLabelState(
        this.objectLabelStructure,
        this.objectLabelContext,
        this.objectLabelAnnotation
      );

      this.objectLabelingCompleted = this._isLabelingComplete(this.objectLabelState);
    });
  }

  _initializeLabelState() {
    this.metaLabelState = this._updateLabelState(this.metaLabelStructure, this.metaLabelContext, this.metaLabelAnnotation);
    this.objectLabelState = this._updateLabelState(this.objectLabelStructure, this.objectLabelContext, this.objectLabelAnnotation);
  }

  _updateLabelState(structure, context, annotation) {
    return this._annotationLabelStructureVisitor.visit(
      this._linearLabelStructureVisitor.visit(
        structure,
        context
      ),
      annotation
    );
  }

  _isLabelingComplete(state) {
    return state.children.reduce(
      (completeSoFar, category) => completeSoFar && category.metadata.value !== null,
      true
    );
  }
}

LabelSelectorController.$inject = [
  '$scope',
  'annotationLabelStructureVisitor',
  'linearLabelStructureVisitor',
];
