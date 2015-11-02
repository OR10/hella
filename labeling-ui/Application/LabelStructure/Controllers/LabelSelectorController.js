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
    });

    $scope.$watchCollection('vm.objectLabelContext', () => {
      const classes = Object.values(this.objectLabelContext);

      this.objectLabelState = this._updateLabelState(
        this.objectLabelState,
        classes,
        this.objectLabelAnnotation
      );
    });
  }

  _initializeLabelState() {
    this.metaLabelState = this._updateLabelState(this.metaLabelStructure, [], this.metaLabelAnnotation);
    this.objectLabelState = this._updateLabelState(this.objectLabelStructure, [], this.objectLabelAnnotation);
  }

  _updateLabelState(state, context, annotation) {
    console.log(annotation);
    const updatedStructure = this._linearLabelStructureVisitor.visit(state, context);
    return this._labelStructureAnnotationService.visit(updatedStructure, annotation);
  }
}

LabelSelectorController.$inject = ['$scope', 'annotationLabelStructureVisitor', 'linearLabelStructureVisitor'];
