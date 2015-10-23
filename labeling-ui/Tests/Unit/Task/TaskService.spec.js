import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import TaskService from 'Application/Task/Services/TaskService';

describe('TaskService', () => {
  let $httpBackend;
  let service;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      service = $injector.instantiate(TaskService);
    });
  });

  it('should be instantiatable', () => {
    expect(service instanceof TaskService).toBe(true);
  });

  it('should load a list of tasks', (done) => {
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
      ],
    };

    $httpBackend.expectGET('/backend/api/task').respond(tasksResponse);

    service.getTasks().then((tasks) => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single task', (done) => {
    const taskResponse = {
      result: {foo: 'bar'},
    };

    $httpBackend.expectGET('/backend/api/task/123asdf').respond(taskResponse);

    service.getTask('123asdf').then((task) => {
      expect(task).toEqual(taskResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
