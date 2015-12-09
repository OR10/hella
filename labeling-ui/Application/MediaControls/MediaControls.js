import Module from '../Module';

import MediaControlsDirective from './Directives/MediaControlsDirective';

import 'angular-rangeslider-directive';
import 'angular-ui-bootstrap/src/position/position';
import 'angular-ui-bootstrap/src/stackedMap/stackedMap';
import 'angular-ui-bootstrap/src/tooltip/tooltip';
import 'angular-ui-bootstrap/src/popover/popover';

import 'jquery-mousewheel';

/**
 * @class MediaControls
 */
export default class MediaControls extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.MediaControls', ['cfp.hotkeys', 'angularRangeSlider', 'ui.bootstrap.popover']);

    this.registerDirective('mediaControls', MediaControlsDirective);
  }
}
