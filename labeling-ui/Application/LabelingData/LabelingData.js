import Module from '../Module';
import CachingLabeledThingInFrameGateway from './Gateways/CachingLabeledThingInFrameGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';
import CachingLabeledThingGateway from './Gateways/CachingLabeledThingGateway';
import InterpolationService from './Services/InterpolationService';
import LinearBackendInterpolation from './Interpolations/LinearBackendInterpolation';
import CacheService from './Services/CacheService';
import DataPrefetcher from './Services/DataPrefetcher';

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

    this.module.service('labeledThingInFrameGateway', CachingLabeledThingInFrameGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);
    this.module.service('labeledThingGateway', CachingLabeledThingGateway);

    this.module.service('interpolationService', InterpolationService);
    this.module.service('linearBackendInterpolation', LinearBackendInterpolation);

    this.module.service('dataPrefetcher', DataPrefetcher);

    this.module.service('cacheService', CacheService);
  }
}

export default LabelingData;
