import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import TaskGateway from 'Application/Task/Gateways/TaskGateway';

describe('TaskGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(TaskGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof TaskGateway).toBe(true);
  });

  it('should load a list of tasks', (done) => {
    const tasksResponse = {
      result: {
        tasks: {
          preprocessing: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          waiting: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          labeled: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
        },
        videos: {},
      },
    };

    $httpBackend.expectGET('/backend/api/task').respond(tasksResponse);

    gateway.getTasks().then((tasks) => {
      expect(tasks).toEqual(tasksResponse.result.tasks);
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of tasks with videos', (done) => {
    const tasksResponse = {
      result: {
        tasks: {
          preprocessing: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          waiting: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          labeled: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
        },
        videos: {
          '123': {id: 'blub'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/task?includeVideos=true').respond(tasksResponse);

    gateway.getTasksAndVideos().then(result => {
      expect(result).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of tasks with videos for a specific task', (done) => {
    const tasksResponse = {
      result: {
        tasks: {
          preprocessing: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          waiting: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
          labeled: [
            {foo: 'bar'},
            {bar: 'baz'},
          ],
        },
        videos: {
          '123': {id: 'blub'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/task?includeVideos=true&project=awesome-project-id').respond(tasksResponse);

    gateway.getTasksAndVideosForProject('awesome-project-id').then(result => {
      expect(result).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single task', (done) => {
    const taskResponse = {
      result: {foo: 'bar'},
    };

    $httpBackend.expectGET('/backend/api/task/123asdf').respond(taskResponse);

    gateway.getTask('123asdf').then((task) => {
      expect(task).toEqual(taskResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should mark tasks as labeled', (done) => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/labeled').respond(markResponse);

    gateway.markTaskAsLabeled({id: '123asdf'}).then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should mark tasks as waiting', (done) => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/waiting').respond(markResponse);

    gateway.markTaskAsWaiting({id: '123asdf'}).then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
