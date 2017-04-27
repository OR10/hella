/**
 * Module containing all functionality related to Labels and its Data
 *
 * @extends Module
 */
import Module from '../Module';
import CacheHeatingLabeledThingInFrameGateway from './Gateways/CacheHeatingLabeledThingInFrameGateway';
import CachingLabeledThingInFrameGateway from './Gateways/CachingLabeledThingInFrameGateway';
import LabeledThingGroupGateway from './Gateways/LabeledThingGroupGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';
import CacheHeatingLabeledThingGateway from './Gateways/CacheHeatingLabeledThingGateway';
import InterpolationService from './Services/InterpolationService';
import LinearBackendInterpolation from './Interpolations/LinearBackendInterpolation';
import CacheService from './Services/CacheService';
import CacheHeaterService from './Services/CacheHeaterService';
import GhostingService from './Services/GhostingService';

import PouchDbLabeledThingGateway from './Gateways/PouchDbLabeledThingGateway';
import PouchDbLabeledThingInFrameGateway from './Gateways/PouchDbLabeledThingInFrameGateway';
import PouchDbLabeledThingGroupGateway from './Gateways/PouchDbLabeledThingGroupGateway';
import LinearRectangleInterpolationEasing from './Interpolations/Easing/LinearRectangleInterpolationEasing';
import FrontendInterpolation from './Interpolations/FrontendInterpolation';
import LinearPedestrianInterpolationEasing from './Interpolations/Easing/LinearPedestrianInterpolationEasing';


class LabelingData extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular, featureFlags) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('labeledThingInFrameGateway', CacheHeatingLabeledThingInFrameGateway);
    this.module.service('cachingLabeledThingInFrameGateway', CachingLabeledThingInFrameGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);
    this.module.service('labeledThingGateway', CacheHeatingLabeledThingGateway);
    this.module.service('labeledThingGroupGateway', LabeledThingGroupGateway);

    this.module.service('interpolationService', InterpolationService);
    this.module.service('linearBackendInterpolation', LinearBackendInterpolation);

    this.module.service('frontendInterpolation', FrontendInterpolation);
    this.module.service('linearRectangleInterpolationEasing', LinearRectangleInterpolationEasing);
    this.module.service('linearPedestrianInterpolationEasing', LinearPedestrianInterpolationEasing);
    

    this.module.service('cacheService', CacheService);
    this.module.service('cacheHeaterService', CacheHeaterService);

    this.module.service('ghostingService', GhostingService);

    if (featureFlags.pouchdb === true) {
      this.module.service('labeledThingInFrameGateway', PouchDbLabeledThingInFrameGateway);
      this.module.service('labeledThingGateway', PouchDbLabeledThingGateway);
      this.module.service('labeledThingGroupGateway', PouchDbLabeledThingGroupGateway);
    }
  }
}

export default LabelingData;
