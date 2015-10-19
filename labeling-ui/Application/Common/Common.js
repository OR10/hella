import Module from '../Module';

import Demo from './Directives/Demo';
import VideoList from './Directives/VideoList';

export default class Common extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', []);
//    this.registerDirective('demo', Demo);
    this.registerDirective('videolist', VideoList);
  }
}
