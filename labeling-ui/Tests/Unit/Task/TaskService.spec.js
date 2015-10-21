import $ from 'jquery';
import angular from 'angular';
import angularMocks from 'angular-mocks';

import TaskService from 'Application/Task/Services/TaskService';

describe('TaskService', () => {
  let $httpBackend;
  let service;

  beforeEach(angularMocks.inject(function($injector) {
    $httpBackend = $injector.get('$httpBackend');

    service = $injector.instantiate(TaskService);
  }));

  it('Should load a list of tasks', (done) => {
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
      ]
    };

    $httpBackend.expectGET('/api/task').respond(tasksResponse);

    service.getTasks().then((tasks) => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('Should load information for a single task', () => {
    const tasksResponse = {

    }
  });
});