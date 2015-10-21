import Module from '../Module';

export default class Frame extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Frame', []);
  }
}
