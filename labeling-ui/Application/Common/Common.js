import Module from '../Module';

export default class Common extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', []);
  }
}
