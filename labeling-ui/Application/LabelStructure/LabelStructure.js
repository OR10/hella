import Module from '../Module';
import LabelSelectorDirective from './Directives/LabelSelectorDirective';
import LabelSummaryDirective from './Directives/LabelSummaryDirective';
import AnnotationLabelStructureVisitor from './Services/AnnotationLabelStructureVisitor';
import LinearLabelStructureVisitor from './Services/LinearLabelStructureVisitor';
import SelectedLabelListLabelStructureVisitor from './Services/SelectedLabelListLabelStructureVisitor';
import SelectedLabelObjectLabelStructureVisitor from './Services/SelectedLabelObjectLabelStructureVisitor';

/**
 * Module containing everything related to the Structure and Display of Labels
 *
 * @extends Module
 */
class LabelStructureModule extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelStructure', []);

    this.registerDirective('labelSelector', LabelSelectorDirective);
    this.registerDirective('labelSummary', LabelSummaryDirective);

    this.module.service('annotationLabelStructureVisitor', AnnotationLabelStructureVisitor);
    this.module.service('linearLabelStructureVisitor', LinearLabelStructureVisitor);
    this.module.service('selectedLabelListLabelStructureVisitor', SelectedLabelListLabelStructureVisitor);
    this.module.service('selectedLabelObjectLabelStructureVisitor', SelectedLabelObjectLabelStructureVisitor);
  }
}

export default LabelStructureModule;
