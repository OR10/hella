import Module from '../Module';
import ViewerDirective from './Directives/ViewerDirective';
import ViewerStageDirective from './Directives/ViewerStageDirective';
import ViewerControlsDirective from './Directives/ViewerControlsDirective';
import PaperScopeServiceProvider from './Providers/PaperScopeServiceProvider';

export default class Viewer extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Viewer', []);
    this.registerDirective('viewer', ViewerDirective);
    this.registerDirective('viewerStage', ViewerStageDirective);
    this.registerDirective('viewerControls', ViewerControlsDirective);

    this.module.provider('paperScopeService', PaperScopeServiceProvider);
  }
}
