import Module from '../Module';
import TaskService from 'Services/TaskService';

export default class Task extends Module {
  registerWithAngular(angular) {
    this.module = angular.module('AnnoStation.Task', []);

    this.module.service('TaskService', TaskService);
  }
}
