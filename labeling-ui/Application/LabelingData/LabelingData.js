/**
 * Module containing all functionality related to Labels and its Data
 *
 * @extends Module
 */
import Module from '../Module';
import InterpolationService from './Services/InterpolationService';
import CacheService from './Services/CacheService';
import GhostingService from './Services/GhostingService';

import LabeledThingGateway from './Gateways/LabeledThingGateway';
import PouchDbLabeledThingInFrameGateway from './Gateways/PouchDbLabeledThingInFrameGateway';
import LabeledThingGroupGateway from './Gateways/LabeledThingGroupGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';
import FrontendInterpolation from './Interpolations/FrontendInterpolation';
import LinearRectangleInterpolationEasing from './Interpolations/Easing/LinearRectangleInterpolationEasing';
import LinearPedestrianInterpolationEasing from './Interpolations/Easing/LinearPedestrianInterpolationEasing';
import LinearPolyInterpolationEasing from './Interpolations/Easing/LinearPolyInterpolationEasing';
import LinearPointInterpolationEasing from './Interpolations/Easing/LinearPointInterpolationEasing';
import LinearCuboidInterpolationEasing from './Interpolations/Easing/LinearCuboidInterpolationEasing';


class LabelingData extends Module {
  /**
   * @inheritDoc
   */
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('interpolationService', InterpolationService);

    this.module.service('cacheService', CacheService);

    this.module.service('ghostingService', GhostingService);

    this.module.service('labeledThingInFrameGateway', PouchDbLabeledThingInFrameGateway);
    this.module.service('labeledThingGateway', LabeledThingGateway);
    this.module.service('labeledThingGroupGateway', LabeledThingGroupGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);

    this.module.service('interpolationType', FrontendInterpolation);
    this.module.service('linearRectangleInterpolationEasing', LinearRectangleInterpolationEasing);
    this.module.service('linearPedestrianInterpolationEasing', LinearPedestrianInterpolationEasing);
    this.module.service('linearPolyInterpolationEasing', LinearPolyInterpolationEasing);
    this.module.service('linearPointInterpolationEasing', LinearPointInterpolationEasing);
    this.module.service('linearCuboidInterpolationEasing', LinearCuboidInterpolationEasing);
  }
}

export default LabelingData;
