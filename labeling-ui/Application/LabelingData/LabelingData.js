import Module from '../Module';
import LabelingDataGateway from './Gateways/LabelingDataGateway';

export default class LabelingData extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('labelingDataGateway', LabelingDataGateway);
  }
}
