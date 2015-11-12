import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import TaskGateway from 'Application/Task/Gateways/TaskGateway';

describe('TaskGateway', () => {
  let $httpBackend;
  let bufferedHttp;
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
      bufferedHttpProvider.enableFlushFunctionality();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      bufferedHttp = $injector.get('bufferedHttp');
      gateway = $injector.instantiate(TaskGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof TaskGateway).toBe(true);
  });

  it('should load a list of tasks', (done) => {
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
      ],
    };

    $httpBackend.expectGET('/backend/api/task').respond(tasksResponse);

    gateway.getTasks().then((tasks) => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
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

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });
});
