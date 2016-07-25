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

  it('should load a list of tasks for a given project and status', done => {
    const projectId = '123123123';
    const status = 'todo';
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
      ],
      totalRows: 10,
    };

    $httpBackend.expectGET(`/backend/api/task?project=${projectId}&taskStatus=${status}`).respond(tasksResponse);

    gateway.getTasksForProject(projectId, status).then(tasks => {
      expect(tasks).toEqual(tasksResponse);
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of tasks for a given project and status with limit and offset', done => {
    const projectId = '123123123';
    const status = 'todo';
    const limit = 5;
    const offset = 10;
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
        {bar: 'baz'},
      ],
      totalRows: 5,
    };

    $httpBackend.expectGET(`/backend/api/task?limit=${limit}&offset=${offset}&project=${projectId}&taskStatus=${status}`).respond(tasksResponse);

    gateway.getTasksForProject(projectId, status, limit, offset).then(tasks => {
      expect(tasks).toEqual(tasksResponse);
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single task', done => {
    const taskResponse = {
      result: {foo: 'bar'},
    };

    $httpBackend.expectGET('/backend/api/task/123asdf').respond(taskResponse);

    gateway.getTask('123asdf').then(task => {
      expect(task).toEqual(taskResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should mark tasks as done', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/done').respond(markResponse);

    gateway.markTaskAsDone('123asdf').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should mark tasks as todo', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/todo').respond(markResponse);

    gateway.markTaskAsTodo('123asdf').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should mark tasks as in progress', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/in_progress').respond(markResponse);

    gateway.markTaskAsInProgress('123asdf').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should assign a user and mark tasks as in progress', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/begin').respond(markResponse);

    gateway.assignAndMarkAsInProgress('123asdf').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should assign a user to a task', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPUT('/backend/api/task/taskId123/user/userId123/assign').respond(markResponse);

    gateway.assignUserToTask({id: 'taskId123'}, {id: 'userId123'}).then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should get the task count', done => {
    const response = {
      result: {
        labeling: {
          preprocessing: 0,
          todo: 6,
          done: 0,
        },
      },
    };

    $httpBackend.expectGET('/backend/api/taskCount/projectId123').respond(response);

    gateway.getTaskCount('projectId123').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should reopen a task', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectPOST('/backend/api/task/123asdf/status/reopen').respond(markResponse);

    gateway.reopenTask('123asdf').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should unassign a user from a task', done => {
    const markResponse = {
      result: {success: true},
    };

    $httpBackend.expectDELETE('/backend/api/task/123asdf/user/09876543/assign').respond(markResponse);

    gateway.unassignUserFromTask('123asdf', '09876543').then(result => {
      expect(result).toEqual(markResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
