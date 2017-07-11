import Module from '../Module';
import FrameGateway from './Gateways/FrameGateway';
import CachingFrameLocationGateway from './Gateways/CachingFrameLocationGateway';
import ImageFactory from './Services/ImageFactory';
import ImageFetcher from './Services/ImageFetcher';
import ImageCache from './Services/ImageCache';

/**
 * Frame Module
 *
 * This module contains all the different implementations regarding Frame handling
 *
 * @extends Module
 */
class Frame extends Module {
  /**
   * Register this module with the angular API.
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Frame', []);

    this.module.service('imageCache', ImageCache);
    this.module.service('imageFetcher', ImageFetcher);
    this.module.service('imageFactory', ImageFactory);
    this.module.service('frameGateway', FrameGateway);
    this.module.service('frameLocationGateway', CachingFrameLocationGateway);
  }
}

export default Frame;
