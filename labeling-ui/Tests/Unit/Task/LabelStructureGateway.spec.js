import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabelStructureGateway from 'Application/Task/Gateways/LabelStructureGateway';

describe('LabelStructureGateway', () => {
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
      gateway = $injector.instantiate(LabelStructureGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof LabelStructureGateway).toBe(true);
  });

  it('should load a the label structure data', done => {
    const taskId = '1234';
    const tasksResponse = {
      result: {
        structure: {
          'a': {
            foo: 'bar',
            bar: 'baz',
          },
          'b': {
            foo: 'bar',
            bar: 'baz',
          },
        },
        annotation: {
          'c': {
            foo: 'bar',
            bar: 'baz',
          },
          'd': {
            foo: 'bar',
            bar: 'baz',
          },
        },
      },
    };

    $httpBackend.expectGET(`/backend/api/task/${taskId}/labelStructure`).respond(tasksResponse);

    gateway.getLabelStructureData(taskId).then(structureData => {
      expect(structureData).toEqual(tasksResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
