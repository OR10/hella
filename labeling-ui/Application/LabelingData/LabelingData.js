import Module from '../Module';
import LabeledThingInFrameGateway from './Gateways/LabeledThingInFrameGateway';
import LabeledFrameGateway from './Gateways/LabeledFrameGateway';

export default class LabelingData extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('labeledThingInFrameGateway', LabeledThingInFrameGateway);
    this.module.service('labeledFrameGateway', LabeledFrameGateway);
  }
}
