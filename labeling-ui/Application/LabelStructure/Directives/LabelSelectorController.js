/**
 * @class LabelSelectorController
 */
export default class LabelSelectorController {
  constructor($scope, labelStructureAnnotationService, linearLabelStructureVisitor) {
    this._labelStructureAnnotationService = labelStructureAnnotationService;
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    this.firstOpen = true;

    this.metaLabelContext = {};
    this.objectLabelContext = {};

    this._initializeLabelState();

    $scope.$watchCollection('vm.metaLabelContext', () => {
      const classes = Object.values(this.metaLabelContext);

      this.metaLabelState = this._updateLabelState(
        this.metaLabelState,
        classes,
        this.metaLabelAnnotation
      );

      const labelingComplete = this._isLabelingComplete(this.metaLabelState);
      this.onMetaLabelingChanged({
        classes: Object.values(this.metaLabelContext),
        incomplete: !labelingComplete,
      });
    });

    $scope.$watchCollection('vm.objectLabelContext', () => {
      const classes = Object.values(this.objectLabelContext);

      this.objectLabelState = this._updateLabelState(
        this.objectLabelState,
        classes,
        this.objectLabelAnnotation
      );

      const labelingComplete = this._isLabelingComplete(this.objectLabelState);
      this.onObjectLabelingChanged({
        classes: Object.values(this.objectLabelContext),
        incomplete: !labelingComplete,
      });
    });
  }

  _initializeLabelState() {
    this.metaLabelState = this._updateLabelState(this.metaLabelStructure, [], this.metaLabelAnnotation);
    this.objectLabelState = this._updateLabelState(this.objectLabelStructure, [], this.objectLabelAnnotation);
  }

  _updateLabelState(state, context, annotation) {
    const updatedStructure = this._linearLabelStructureVisitor.visit(state, context);
    return this._labelStructureAnnotationService.visit(updatedStructure, annotation);
  }

  _isLabelingComplete(state) {
    return state.children.reduce((completeSoFar, category) => completeSoFar && category.metadata.value !== null, true);
  }
}

LabelSelectorController.$inject = ['$scope', 'annotationLabelStructureVisitor', 'linearLabelStructureVisitor'];
