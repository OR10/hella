import Module from '../Module';

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
  }
}

export default ThirdDimension;
