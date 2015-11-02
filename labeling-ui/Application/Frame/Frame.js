import Module from '../Module';
import FrameGateway from './Gateways/FrameGateway';
import TaskFrameLocationGateway from './Gateways/TaskFrameLocationGateway';

export default class Frame extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Frame', []);

    this.module.service('frameGateway', FrameGateway);
    this.module.service('taskFrameLocationGateway', TaskFrameLocationGateway);
  }
}
