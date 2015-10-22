import Module from '../Module';
import ApiService from './Services/ApiService';

export default class Common extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Common', []);
    this.module.service('ApiService', ApiService);
  }
}
