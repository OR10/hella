/**
 * @class LabelSelectorController
 */
export default class LabelSelectorController {
  constructor(labelStructureAnnotationService, linearLabelStructureVisitor) {
    this._labelStructureAnnotationService = labelStructureAnnotationService;
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    this.metaLabelState = linearLabelStructureVisitor.visit(this.metaLabelStructure, {});
    this.objectLabelState = linearLabelStructureVisitor.visit(this.objectLabelStructure, {});

    this.metaLabelState = labelStructureAnnotationService.visit(this.metaLabelState, this.metaLabelAnnotation);
    this.objectLabelState = labelStructureAnnotationService.visit(this.objectLabelState, this.objectLabelAnnotation);

    this.firstOpen = true;
  }

}

LabelSelectorController.$inject = ['annotationLabelStructureVisitor', 'linearLabelStructureVisitor'];
