import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import ProjectGateway from 'Application/Project/Gateways/ProjectGateway';

describe('ProjectGateway', () => {
  let $httpBackend;
  let gateway;

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
      gateway = $injector.instantiate(ProjectGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof ProjectGateway).toBe(true);
  });

  it('should load a list of projects', (done) => {
    const response = {
      result: [
        {
          id: '7999cf8d8d5275330fa67fc69501d977',
          name: 'example project',
          taskCount: 1,
          taskFinishedCount: 1,
        },
        {
          taskId: '7999cf8d8d5275330fa67fc69502b446',
          name: 'example project 2',
          taskCount: 2,
          taskFinishedCount: 2,
        },
      ],
    };

    $httpBackend.expectGET('/backend/api/project').respond(response);

    gateway.getProjects().then(projects => {
      expect(projects).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });
});
