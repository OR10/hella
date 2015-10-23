import Module from '../Module';
import FrameService from './Services/FrameService';
import TaskFrameLocationService from './Services/TaskFrameLocationService';

export default class Frame extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Frame', []);

    this.module.service('frameService', FrameService);
    this.module.service('taskFrameLocationService', TaskFrameLocationService);
  }
}
