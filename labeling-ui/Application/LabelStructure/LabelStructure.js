import 'angular-ui-bootstrap/src/collapse/collapse';
import 'angular-ui-bootstrap/src/accordion/accordion';

import Module from '../Module';
import LabelSelectorDirective from './Directives/LabelSelectorDirective';
import LabelStructureAnnotationService from './Services/LabelStructureAnnotationService';
import LinearLabelStructureVisitor from './Services/LinearLabelStructureVisitor';

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
    ]);

    this.registerDirective('labelSelector', LabelSelectorDirective);

    this.module.service('labelStructureAnnotationService', LabelStructureAnnotationService);
    this.module.service('linearLabelStructureVisitor', LinearLabelStructureVisitor);
  }
}
