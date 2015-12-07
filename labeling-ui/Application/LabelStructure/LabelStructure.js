import 'angular-ui-bootstrap/src/collapse/collapse';
import 'angular-ui-bootstrap/src/accordion/accordion';
import 'angular-ui-bootstrap/src/carousel/carousel';

import Module from '../Module';
import LabelSelectorDirective from './Directives/LabelSelectorDirective';
import LabelWizardDirective from './Directives/LabelWizardDirective';
import LabelSummaryDirective from './Directives/LabelSummaryDirective';
import AnnotationLabelStructureVisitor from './Services/AnnotationLabelStructureVisitor';
import LinearLabelStructureVisitor from './Services/LinearLabelStructureVisitor';
import SelectedLabelListLabelStructureVisitor from './Services/SelectedLabelListLabelStructureVisitor';
import SelectedLabelObjectLabelStructureVisitor from './Services/SelectedLabelObjectLabelStructureVisitor';

import labelWizardCarouselTemplate from './Directives/LabelWizard/wizard-carousel.html!';

/**
 * Module containing everything related to the Structure and Display of Labels
 *
 * @extends Module
 */
class LabelStructure extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelStructure', [
      'ui.bootstrap.collapse',
      'ui.bootstrap.accordion',
      'ui.bootstrap.carousel',
    ]);

    this.registerDirective('labelSelector', LabelSelectorDirective);
    this.registerDirective('labelWizard', LabelWizardDirective);
    this.registerDirective('labelSummary', LabelSummaryDirective);

    this.module.service('annotationLabelStructureVisitor', AnnotationLabelStructureVisitor);
    this.module.service('linearLabelStructureVisitor', LinearLabelStructureVisitor);
    this.module.service('selectedLabelListLabelStructureVisitor', SelectedLabelListLabelStructureVisitor);
    this.module.service('selectedLabelObjectLabelStructureVisitor', SelectedLabelObjectLabelStructureVisitor);

    this.module.run(['$templateCache', $templateCache => {
      $templateCache.put('LabelWizard/wizard-carousel.html', labelWizardCarouselTemplate);
    }]);
  }
}

export default LabelStructure;
