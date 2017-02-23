import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import ProjectGateway from 'Application/ManagementBoard/Gateways/ProjectGateway';
import Organisation from 'Application/Organisation/Models/Organisation';

describe('ProjectGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module($provide => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });

      $provide.value('organisationService', {
        get: () => new Organisation('organisation-id', 'organisation-name', 100),
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

  it('should load a single project', done => {
    const projectId = '7999cf8d8d5275330fa67fc69501d977';
    const response = {
      result: {
        id: projectId,
        name: 'example project',
        taskCount: 1,
        taskFinishedCount: 1,
      },
    };

    $httpBackend.expectGET('/backend/api/project/7999cf8d8d5275330fa67fc69501d977').respond(response);

    gateway.getProject(projectId).then(project => {
      expect(project).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of projects', done => {
    const response = {
      result: [
        {
          id: '7999cf8d8d5275330fa67fc69501d977',
          name: 'example project',
        },
        {
          taskId: '7999cf8d8d5275330fa67fc69502b446',
          name: 'example project 2',
        },
      ],
      totalRows: 2,
    };

    $httpBackend.expectGET('/backend/api/organisation/organisation-id/project').respond(response);

    gateway.getProjects().then(projects => {
      expect(projects).toEqual(response);
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of projects counts', done => {
    const response = {
      result: [
        {
          foo: 1,
        },
        {
          bar: 2,
        },
      ],
    };

    $httpBackend.expectGET('/backend/api/organisation/organisation-id/projectCount').respond(response);

    gateway.getProjectCount().then(projects => {
      expect(projects).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });


  it('should load list of export for the project', done => {
    const projectId = '7999cf8d8d5275330fa67fc69501d977';
    const response = {
      result: [{
        id: 'bc23be6c5f427907b8b891ae1e06b805',
        projectId: 'bc23be6c5f427907b8b891ae1e032543',
        filename: 'csv_20160413_074730.zip',
        taskIds: ['bc23be6c5f427907b8b891ae1e031ecf', 'bc23be6c5f427907b8b891ae1e030363'],
      }, {
        id: 'bc23be6c5f427907b8b891ae1e06b805',
        projectId: 'bc23be6c5f427907b8b891ae1e032543',
        filename: 'csv_20160413_074730.zip',
        taskIds: ['bc23be6c5f427907b8b891ae1e030850', 'bc23be6c5f427907b8b891ae1e0315d3'],
      }],
    };

    $httpBackend.expectGET('/backend/api/project/7999cf8d8d5275330fa67fc69501d977/export').respond(response);

    gateway.getExports(projectId).then(project => {
      expect(project).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should accept a project', done => {
    const response = {
      result: true,
    };

    $httpBackend.expectPOST('/backend/api/project/PROJECT_ID/status/accept').respond(response);

    gateway.acceptProject('PROJECT_ID').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should close a project', done => {
    const response = {
      result: true,
    };

    $httpBackend.expectPOST('/backend/api/project/PROJECT_ID/status/done').respond(response);

    gateway.closeProject('PROJECT_ID').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should delete a project', done => {
    const response = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPOST('/backend/api/project/PROJECT_ID/delete').respond(response);

    gateway.deleteProject('PROJECT_ID').then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });
});
