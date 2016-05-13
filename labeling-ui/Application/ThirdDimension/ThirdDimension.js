import Module from '../Module';
import Projection2d from './Services/Projection2d';

/**
 * ThirdDimension Module
 *
 * @extends Module
 */
class ThirdDimension extends Module {
  /**
   * Register this {@link Module} with the angular service container system
   *
   * @param {angular} angular
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.ThirdDimension', []);
    
    this.module.service('Projection2dService', Projection2d);
  }
}

export default ThirdDimension;
