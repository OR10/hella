import Module from '../Module';
import LabelingDataService from './Services/LabelingDataService';

export default class LabelingData extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.LabelingData', []);

    this.module.service('labelingDataService', LabelingDataService);
  }
}
