import 'angular-ui-bootstrap/src/collapse/collapse';
import 'angular-ui-bootstrap/src/accordion/accordion';
import 'angular-ui-bootstrap/src/carousel/carousel';

import Module from '../Module';
import LabelSelectorDirective from './Directives/LabelSelectorDirective';
import LabelWizardDirective from './Directives/LabelWizardDirective';
import LabelSummaryDirective from './Directives/LabelSummaryDirective';
import AnnotationLabelStructureVisitor from './Services/AnnotationLabelStructureVisitor';
import LinearLabelStructureVisitor from './Services/LinearLabelStructureVisitor';

import labelWizardCarouselTemplate from './Directives/LabelWizard/wizard-carousel.html!';

/**
 * @class LabelStructure
 * @extends Module
 */
export default class LabelStructure extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelStructure', [
      'AnnoStation.VendorTemplates',
      'ui.bootstrap.collapse',
      'ui.bootstrap.accordion',
      'ui.bootstrap.carousel',
    ]);

    this.registerDirective('labelSelector', LabelSelectorDirective);
    this.registerDirective('labelWizard', LabelWizardDirective);
    this.registerDirective('labelSummary', LabelSummaryDirective);

    this.module.service('annotationLabelStructureVisitor', AnnotationLabelStructureVisitor);
    this.module.service('linearLabelStructureVisitor', LinearLabelStructureVisitor);

    this.module.run(['$templateCache', $templateCache => {
      $templateCache.put('LabelWizard/wizard-carousel.html', labelWizardCarouselTemplate);
    }]);
  }
}
