import Module from '../Module';

import ViewerDirective from './Directives/ViewerDirective';

import PaperShapeFactory from './Shapes/PaperShapeFactory';

import DrawingContextServiceProvider from './Providers/DrawingContextServiceProvider';

import 'jquery-mousewheel';

/**
 * @class MediaControls
 */
export default class Viewer extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Viewer', ['cfp.hotkeys']);

    this.registerDirective('viewer', ViewerDirective);

    this.module.service('paperShapeFactory', PaperShapeFactory);

    this.module.provider('drawingContextService', DrawingContextServiceProvider);
  }
}
