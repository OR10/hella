import Module from '../Module';

import MediaControlsDirective from './Directives/MediaControlsDirective';

import brightnessSliderTemplate from './Directives/BrightnessSlider.html!';
import contrastSliderTemplate from './Directives/ContrastSlider.html!';

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

    this.module.run(['$templateCache', $templateCache => {
      $templateCache.put('MediaControls/MediaControlsDirective/BrightnessSlider.html', brightnessSliderTemplate);
      $templateCache.put('MediaControls/MediaControlsDirective/ContrastSlider.html', contrastSliderTemplate);
    }]);
  }
}
