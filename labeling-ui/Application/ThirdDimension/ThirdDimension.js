import Module from '../Module';
import DimensionPredictionGateway from 'Gateways/DimensionPredictionGateway';

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

    this.module.service('dimensionPredictionGateway', DimensionPredictionGateway);
  }
}

export default ThirdDimension;
