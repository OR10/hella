import 'jquery-ui';
import 'angular-dragdrop';

import Module from '../Module';
import FilmReelDirective from './Directives/FilmReelDirective';
import ThumbnailReelDirective from './Directives/ThumbnailReelDirective';
import ThumbnailDirective from './Directives/ThumbnailDirective';
import FrameNumberInputDirective from './Directives/FrameNumberInputDirective';

/**
 * FilmReel Module
 *
 * @extends Module
 */
class FilmReel extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.FilmReel', ['ngDragDrop']);

    this.registerDirective('filmReel', FilmReelDirective);
    this.registerDirective('thumbnailReel', ThumbnailReelDirective);
    this.registerDirective('thumbnail', ThumbnailDirective);
    this.registerDirective('frameNumberInput', FrameNumberInputDirective);
  }
}

export default FilmReel;
