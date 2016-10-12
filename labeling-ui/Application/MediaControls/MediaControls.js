import Module from '../Module';

import MediaControlsDirective from './Directives/MediaControlsDirective';


/**
 * @class MediaControls
 */
export default class MediaControls extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.MediaControls', []);

    this.registerDirective('mediaControls', MediaControlsDirective);
  }
}
