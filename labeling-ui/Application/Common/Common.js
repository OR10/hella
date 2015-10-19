import Module from '../Module';

import Demo from './Directives/Demo';

export default class Common extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common',[]);
    this.registerDirective('demo', Demo);
  }
}
