/**
 * @class LabelSelectorController
 */
export default class LabelSelectorController {
  constructor(labelStructureAnnotationService, linearLabelStructureVisitor) {
    this._labelStructureAnnotationService = labelStructureAnnotationService;
    this._linearLabelStructureVisitor = linearLabelStructureVisitor;

    this.metaLabelState = linearLabelStructureVisitor.visit(this.metaLabelStructure, []);
    this.objectLabelState = linearLabelStructureVisitor.visit(this.objectLabelStructure, []);

    this.metaLabelState = labelStructureAnnotationService.annotate(this.metaLabelState, this.metaLabelAnnotation);
    this.objectLabelState = labelStructureAnnotationService.annotate(this.objectLabelState, this.objectLabelAnnotation);
  }
}

LabelSelectorController.$inject = ['labelStructureAnnotationService', 'linearLabelStructureVisitor'];