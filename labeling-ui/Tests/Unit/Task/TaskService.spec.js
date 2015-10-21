import 'jquery';
import 'angular';
import angularMocks from 'angular-mocks';

import TaskService from 'Application/Task/Services/TaskService';

describe('TaskService', () => {
  let $httpBackend;
  let service;

  beforeEach(angularMocks.inject($injector => {
    $httpBackend = $injector.get('$httpBackend');

    service = $injector.instantiate(TaskService);
  }));

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

    $httpBackend.expectGET('/api/task').respond(tasksResponse);

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

    $httpBackend.expectGET('/api/task/123asdf').respond(taskResponse);

    service.getTask('123asdf').then((task) => {
      expect(task).toEqual(taskResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
