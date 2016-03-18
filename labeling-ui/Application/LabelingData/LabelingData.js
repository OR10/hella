import Module from '../Module';
import CacheHeatingLabeledThingInFrameGateway from './Gateways/CacheHeatingLabeledThingInFrameGateway';
import CachingLabeledThingInFrameGateway from './Gateways/CachingLabeledThingInFrameGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';
import CacheHeatingLabeledThingGateway from './Gateways/CacheHeatingLabeledThingGateway';
import InterpolationService from './Services/InterpolationService';
import LinearBackendInterpolation from './Interpolations/LinearBackendInterpolation';
import CacheService from './Services/CacheService';
import CacheHeaterService from './Services/CacheHeaterService';

/**
 * Module containing all functionality related to Labels and its Data
 *
 * @extends Module
 */
class LabelingData extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('labeledThingInFrameGateway', CacheHeatingLabeledThingInFrameGateway);
    this.module.service('cachingLabeledThingInFrameGateway', CachingLabeledThingInFrameGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);
    this.module.service('labeledThingGateway', CacheHeatingLabeledThingGateway);

    this.module.service('interpolationService', InterpolationService);
    this.module.service('linearBackendInterpolation', LinearBackendInterpolation);

    this.module.service('cacheService', CacheService);
    this.module.service('cacheHeaterService', CacheHeaterService);
  }
}

export default LabelingData;
