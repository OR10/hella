import Module from '../Module';
import LabeledThingInFrameGateway from './Gateways/LabeledThingInFrameGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';

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
  }
}

export default LabelingData;
