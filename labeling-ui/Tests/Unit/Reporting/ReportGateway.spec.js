import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import ReportGateway from 'Application/Reporting/Gateways/ReportGateway';

describe('ReportGateway', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
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

      $provide.value('organisationService', {
        get: () => 'ORGANISATION-ID',
      });

      bufferedHttpProvider.disableAutoExtractionAndInjection();
    });

    inject($injector => {
      $httpBackend = $injector.get('$httpBackend');
      gateway = $injector.instantiate(ReportGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof ReportGateway).toBe(true);
  });

  it('should get a list of reports', done => {
    const projectId = '123123123';
    const tasksResponse = {
      result: [
        {foo: 'bar'},
        {bar: 'baz'},
      ],
    };

    $httpBackend.expectGET(`/backend/api/organisation/ORGANISATION-ID/project/${projectId}/report`).respond(tasksResponse);

    gateway.getReports(projectId).then(tasks => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should get a single report', done => {
    const projectId = '123123123';
    const reportId = '56756757';
    const tasksResponse = {
      result: {foo: 'bar'},
    };

    $httpBackend.expectGET(`/backend/api/organisation/ORGANISATION-ID/project/${projectId}/report/${reportId}`).respond(tasksResponse);

    gateway.getReport(projectId, reportId).then(tasks => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });

  it('should start a report', done => {
    const projectId = '123123123';
    const tasksResponse = {
      result: {succes: true},
    };

    $httpBackend.expectPOST(`/backend/api/organisation/ORGANISATION-ID/project/${projectId}/report`).respond(tasksResponse);

    gateway.startReport(projectId).then(tasks => {
      expect(tasks).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
