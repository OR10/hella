import Module from '../Module';
import VideoGateway from './Gateways/VideoGateway';

/**
 * Module containing all functionality related to {@link Video}s
 *
 * @extends Module
 */
class Video extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Video', []);

    this.module.service('videoGateway', VideoGateway);
  }
}

export default Video;
