import Module from '../Module';
import LabeledThingInFrameGateway from './Gateways/LabeledThingInFrameGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';
import LabeledThingGateway from './Gateways/LabeledThingGateway';
import InterpolationService from './Services/InterpolationService';
import LinearBackendInterpolation from './Interpolations/LinearBackendInterpolation';
import DataContainerProvider from './Services/DataContainerProvider';
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

    this.module.service('labeledThingInFrameGateway', LabeledThingInFrameGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);
    this.module.service('labeledThingGateway', LabeledThingGateway);

    this.module.service('interpolationService', InterpolationService);
    this.module.service('linearBackendInterpolation', LinearBackendInterpolation);

    this.module.service('dataPrefetcher', DataPrefetcher);

    this.module.provider('labeledThingInFrameData', DataContainerProvider);
    this.module.provider('labeledThingData', DataContainerProvider);
    this.module.provider('labeledFrameData', DataContainerProvider);
  }
}

export default LabelingData;
