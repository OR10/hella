import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import OrganisationGateway from 'Application/Organisation/Gateways/OrganisationGateway';
import Organisation from 'Application/Organisation/Models/Organisation';

describe('OrganisationGateway', () => {
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
      gateway = $injector.instantiate(OrganisationGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof OrganisationGateway).toBe(true);
  });

  it('should load all available organisations', done => {
    const organisationResponse = {
      result: [
        {id: '111', name: 'organisation 1', quota: 0, diskUsage: {total: 123, videos: 456, images: {thumbnail: 789}}},
        {id: '222', name: 'organisation 2', quota: 0, diskUsage: {total: 123, videos: 456, images: {thumbnail: 789}}},
        {id: '333', name: 'organisation 3', quota: 0, diskUsage: {total: 123, videos: 456, images: {thumbnail: 789}}},
      ],
    };

    $httpBackend.expectGET('/backend/api/organisation').respond(organisationResponse);

    gateway.getOrganisations().then(organisations => {
      expect(organisations).toEqual(organisationResponse.result.map(doc => new Organisation(doc)));
      done();
    });

    $httpBackend.flush();
  });

  it('should create a new organisation', done => {
    const name = 'organisation-name';
    const quota = 0;

    const organisationResponse = {
      result: {
        id: 'organisation-id',
        name,
        quota,
        diskUsage: {
          total: 123,
          videos: 456,
          images: {
            thumbnail: 789,
          },
        },
      },
    };

    $httpBackend.expectPOST('/backend/api/organisation').respond(organisationResponse);

    gateway.createOrganisation(name, quota).then(result => {
      expect(result).toEqual(new Organisation(organisationResponse.result));
      done();
    });

    $httpBackend.flush();
  });

  it('should update a organisation', done => {
    const organisationResponse = {
      result: {
        id: 'organisation-id',
        name: 'organisation-name',
        quota: 0,
        diskUsage: {
          total: 123,
          videos: 456,
          images: {
            thumbnail: 789,
          },
        },
      },
    };
    const updatedOrganisation = new Organisation(organisationResponse.result);

    $httpBackend.expectPUT('/backend/api/organisation/organisation-id').respond(organisationResponse);

    gateway.updateOrganisation(updatedOrganisation).then(result => {
      expect(result).toEqual(new Organisation(organisationResponse.result));
      done();
    });

    $httpBackend.flush();
  });
});
