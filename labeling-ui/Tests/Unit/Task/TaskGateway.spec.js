import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import Task from 'Application/Task/Model/Task';
import User from 'Application/ManagementBoard/Models/User';
import TaskGateway from 'Application/Task/Gateways/TaskGateway';

describe('TaskGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: true,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      // @TODO: Insert mock here once `PouchDB` related methods of TaskGateway are tested here!
      // @TODO: Move `PouchDB` related methods of TaskGateway to own class
      $provide.value('pouchDbContextService', {});
      $provide.value('pouchDbSyncManager', {});

      $provide.value('organisationService', {
        get: () => 'ORGANISATION-ID',
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

  it('should load a list of tasks for a given project, phase and status', done => {
    const projectId = 'project-id-1';
    const status = 'todo';
    const phase = 'labeling';
    const response = {
      result: {
        tasks: [
          {id: 'task-1'},
          {id: 'task-2'},
          {id: 'task-3'},
          {id: 'task-4'},
          {id: 'task-5'},
        ],
        users: {},
      },
      totalRows: 5,
    };

    $httpBackend.expectGET(`/backend/api/task?phase=${phase}&project=${projectId}&taskStatus=${status}`).respond(response);

    gateway.getTasksForProjectWithPhaseAndStatus(projectId, phase, status).then(result => {
      expect(result.totalRows).toEqual(5);
      expect(result.tasks).toEqual(response.result.tasks.map(task => new Task(task, response.result.users)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of tasks for a given project and status with limit and offset', done => {
    const projectId = 'project-id-1';
    const status = 'todo';
    const phase = 'labeling';
    const limit = 5;
    const offset = 10;
    const response = {
      result: {
        tasks: [
          {id: 'task-1'},
          {id: 'task-2'},
          {id: 'task-3'},
          {id: 'task-4'},
          {id: 'task-5'},
        ],
        users: {},
      },
      totalRows: 100,
    };

    $httpBackend.expectGET(
      `/backend/api/task?limit=${limit}&offset=${offset}&phase=${phase}&project=${projectId}&taskStatus=${status}`
    ).respond(response);

    gateway.getTasksForProjectWithPhaseAndStatus(projectId, phase, status, limit, offset).then(result => {
      expect(result.totalRows).toEqual(100);
      expect(result.tasks).toEqual(response.result.tasks.map(task => new Task(task, response.result.users)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of flagged tasks', done => {
    const projectId = 'project-id-1';
    const response = {
      result: {
        tasks: [
          {id: 'task-3'},
          {id: 'task-4'},
        ],
        users: {},
      },
      totalRows: 2,
    };

    $httpBackend.expectGET(`/backend/api/organisation/ORGANISATION-ID/project/${projectId}/attentionTasks`).respond(response);

    gateway.getFlaggedTasks(projectId).then(result => {
      expect(result.totalRows).toEqual(2);
      expect(result.tasks).toEqual(response.result.tasks.map(task => new Task(task, response.result.users)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of flagged tasks with offset and limit', done => {
    const projectId = 'project-id-1';
    const response = {
      result: {
        tasks: [
          {id: 'task-3'},
          {id: 'task-4'},
        ],
        users: {},
      },
      totalRows: 2,
    };

    $httpBackend.expectGET(`/backend/api/organisation/ORGANISATION-ID/project/${projectId}/attentionTasks?limit=2&offset=23`).respond(response);

    gateway.getFlaggedTasks(projectId, 2, 23).then(result => {
      expect(result.totalRows).toEqual(2);
      expect(result.tasks).toEqual(response.result.tasks.map(task => new Task(task, response.result.users)));
      done();
    });

    $httpBackend.flush();
  });

  it('should inject side-loaded users into tasks while fetching a list', done => {
    const projectId = 'project-id-1';
    const status = 'todo';
    const phase = 'labeling';
    const response = {
      result: {
        tasks: [
          {id: 'task-1'},
          {id: 'task-2'},
          {id: 'task-3'},
          {id: 'task-4'},
          {id: 'task-5'},
        ],
        users: {
          'user-1': {id: 'user-1'},
          'user-2': {id: 'user-2'},
          'user-3': {id: 'user-3'},
        },
      },
      totalRows: 5,
    };

    $httpBackend.expectGET(
      `/backend/api/task?phase=${phase}&project=${projectId}&taskStatus=${status}`
    ).respond(response);

    gateway.getTasksForProjectWithPhaseAndStatus(projectId, phase, status).then(result => {
      const userMapping = {
        'user-1': new User(response.result.users['user-1']),
        'user-2': new User(response.result.users['user-2']),
        'user-3': new User(response.result.users['user-3']),
      };

      expect(result.tasks).toEqual(response.result.tasks.map(task => new Task(task, userMapping)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single task', done => {
    const response = {
      result: {
        task: {id: 'task-id-1'},
        users: {},
      },
    };

    $httpBackend.expectGET('/backend/api/task/task-id-1').respond(response);

    gateway.getTask('task-id-1').then(task => {
      expect(task).toEqual(new Task(response.result.task, response.result.users));
      done();
    });

    $httpBackend.flush();
  });

  it('should inject side-loaded users into task while fetching single task', done => {
    const response = {
      result: {
        task: {id: 'task-id-1'},
        users: {
          'user-1': {id: 'user-1'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/task/task-id-1').respond(response);

    gateway.getTask('task-id-1').then(task => {
      expect(task).toEqual(
        new Task(response.result.task, {'user-1': new User(response.result.users['user-1'])})
      );
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

  using([
    ['labeling'],
    ['review'],
    ['revision'],
  ], phase => {
    it('should reopen a task', done => {
      const markResponse = {
        result: {success: true},
      };

      $httpBackend.expectPOST('/backend/api/task/123asdf/status/reopen', {phase}).respond(markResponse);

      gateway.reopenTask('123asdf', phase).then(result => {
        expect(result).toEqual(markResponse.result);
        done();
      });

      $httpBackend.flush();
    });
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

  it('should flag a project', done => {
    const response = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPOST('/backend/api/task/TASK_ID/attention/enable').respond(response);

    gateway.flagTask('TASK_ID').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should unflag a project', done => {
    const response = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPOST('/backend/api/task/TASK_ID/attention/disable').respond(response);

    gateway.unflagTask('TASK_ID').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should move a task to a different phase', done => {
    const response = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPUT('/backend/api/task/TASK_ID/phase', {phase: 'review'}).respond(response);

    gateway.moveTaskToPhase('TASK_ID', 'review').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });
});
