import Module from '../Module';
import FrameGateway from './Gateways/FrameGateway';
import FrameLocationGateway from './Gateways/FrameLocationGateway';

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

    this.module.service('frameGateway', FrameGateway);
    this.module.service('frameLocationGateway', FrameLocationGateway);
  }
}

export default Frame;
