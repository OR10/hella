import Module from '../Module';

import ViewerDirective from './Directives/ViewerDirective';
import ViewerStageDirective from './Directives/ViewerStageDirective';

import PaperShapeFactory from './Shapes/PaperShapeFactory';

import DrawingContextServiceProvider from './Providers/DrawingContextServiceProvider';

import 'jquery-mousewheel';

/**
 * @class MediaControls
 */
export default class Viewer extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Viewer', ['cfp.hotkeys', 'angularRangeSlider', 'ui.bootstrap.popover']);

    this.registerDirective('viewer', ViewerDirective);
    this.registerDirective('viewerStage', ViewerStageDirective);

    this.module.service('paperShapeFactory', PaperShapeFactory);

    this.module.provider('drawingContextService', DrawingContextServiceProvider);
  }
}
