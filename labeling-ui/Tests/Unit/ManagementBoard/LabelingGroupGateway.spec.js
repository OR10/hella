import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import LabelingGroupGateway from 'Application/ManagementBoard/Gateways/LabelingGroupGateway';
import User from 'Application/ManagementBoard/Models/User';
import LabelingGroup from 'Application/ManagementBoard/Models/LabelingGroup';

describe('LabelingGroup', () => {
  let $httpBackend;
  let gateway;

  beforeEach(() => {
    const featureFlags = {};

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    module(($provide, bufferedHttpProvider) => {
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          apiVersion: 'v1',
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
      gateway = $injector.instantiate(LabelingGroupGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof LabelingGroupGateway).toBe(true);
  });

  it('should load a list of labeling groups', done => {
    const response = {
      result: {
        labelingGroups: [
          {
            id: 'group-id-1',
            labeler: ['labeler-id-1', 'labeler-id-2'],
            labelManagers: ['manager-id-1'],
          },
        ],
        users: {
          'labeler-id-1': {id: 'labeler-id-1', username: 'labeler-1', email: 'foo@bar.baz'},
          'labeler-id-2': {id: 'labeler-id-2', username: 'labeler-2', email: 'foo@bar.baz'},
          'manager-id-1': {id: 'manager-id-1', username: 'manager-1', email: 'foo@bar.baz'},
          'manager-id-2': {id: 'manager-id-2', username: 'manager-2', email: 'foo@bar.baz'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup').respond(response);

    gateway.getLabelingGroups().then(data => {
      expect(data.labelingGroups).toEqual(response.result.labelingGroups.map(group => new LabelingGroup(group)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load corresponding user objects for labeling groups', done => {
    const response = {
      result: {
        labelingGroups: [
          {
            id: 'group-id-1',
            labeler: ['labeler-id-1', 'labeler-id-2'],
            labelManagers: ['manager-id-1'],
          },
        ],
        users: {
          'labeler-id-1': {id: 'labeler-id-1', username: 'labeler-1', email: 'foo@bar.baz'},
          'labeler-id-2': {id: 'labeler-id-2', username: 'labeler-2', email: 'foo@bar.baz'},
          'manager-id-1': {id: 'manager-id-1', username: 'manager-1', email: 'foo@bar.baz'},
          'manager-id-2': {id: 'manager-id-2', username: 'manager-2', email: 'foo@bar.baz'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup').respond(response);

    gateway.getLabelingGroups().then(data => {
      const users = {};
      Object.keys(data.users).forEach(userId => users[userId] = new User(data.users[userId]));
      expect(data.users).toEqual(users);
      done();
    });

    $httpBackend.flush();
  });

  it('should create new labeling group', done => {
    const response = {
      result: {
        id: 'group-id-1',
        rev: 'some-revision',
        labeler: ['labeler-id-1', 'labeler-id-2'],
        labelManagers: ['manager-id-1'],
      },
    };

    $httpBackend.expectPOST('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup').respond(response);

    const group = new LabelingGroup(response.result);
    gateway.createLabelingGroup(group).then(createdGroup => {
      expect(createdGroup).toEqual(group);
      done();
    });

    $httpBackend.flush();
  });

  it('should update labeling group', done => {
    const response = {
      result: {
        id: 'group-id-1',
        rev: 'some-revision',
        labeler: ['labeler-id-1', 'labeler-id-2'],
        labelManagers: ['manager-id-1'],
      },
    };

    $httpBackend.expectPUT('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup/group-id-1').respond(response);
    const group = new LabelingGroup(response.result);
    gateway.updateLabelingGroup(group).then(updatedGroup => {
      expect(updatedGroup).toEqual(group);
      done();
    });

    $httpBackend.flush();
  });

  it('should delete labeling group', done => {
    $httpBackend.expectDELETE('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup/group-id-1').respond({result: true});
    gateway.deleteLabelingGroup('group-id-1').then(result => {
      expect(result).toBeTruthy();
      done();
    });

    $httpBackend.flush();
  });

  it('should get my labeling groups', done => {
    const response = {
      result: {
        labelingGroups: [
          {
            id: 'group-id-1',
            labeler: ['labeler-id-1', 'labeler-id-2'],
            labelManagers: ['manager-id-1'],
          },
        ],
        users: {
          'labeler-id-1': {id: 'labeler-id-1', username: 'labeler-1', email: 'foo@bar.baz'},
          'labeler-id-2': {id: 'labeler-id-2', username: 'labeler-2', email: 'foo@bar.baz'},
          'manager-id-1': {id: 'manager-id-1', username: 'manager-1', email: 'foo@bar.baz'},
          'manager-id-2': {id: 'manager-id-2', username: 'manager-2', email: 'foo@bar.baz'},
        },
      },
    };

    $httpBackend.expectGET('/backend/api/v1/organisation/ORGANISATION-ID/labelingGroup/user/groups').respond(response);
    gateway.getMyLabelingGroups().then(result => {
      expect(result).toEqual(response.result);
      done();
    });

    $httpBackend.flush();
  });
});
