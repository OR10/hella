import Module from '../Module';
import ViewerDirective from './Directives/ViewerDirective';
import ViewerStageDirective from './Directives/ViewerStageDirective';
import ViewerControlsDirective from './Directives/ViewerControlsDirective';
import DrawingContextServiceProvider from './Providers/DrawingContextServiceProvider';
import 'angular-rangeslider-directive';
import 'angular-ui-bootstrap/src/position/position';
import 'angular-ui-bootstrap/src/stackedMap/stackedMap';
import 'angular-ui-bootstrap/src/tooltip/tooltip';
import 'angular-ui-bootstrap/src/popover/popover';

/**
 * @class Viewer
 */
export default class Viewer extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Viewer', ['cfp.hotkeys', 'angularRangeSlider', 'ui.bootstrap.popover']);

    this.registerDirective('viewer', ViewerDirective);
    this.registerDirective('viewerStage', ViewerStageDirective);
    this.registerDirective('viewerControls', ViewerControlsDirective);

    this.module.provider('drawingContextService', DrawingContextServiceProvider);
  }
}
