import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import UserGateway from 'Application/ManagementBoard/Gateways/UserGateway';
import User from 'Application/ManagementBoard/Models/User';
import Organisation from 'Application/Organisation/Models/Organisation';

describe('UserGateway', () => {
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
      gateway = $injector.instantiate(UserGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof UserGateway).toBe(true);
  });

  it('should load information for the currently logged in user', done => {
    const userResponse = {
      result: {id: 'me', email: 'foo@bar.baz'},
    };

    $httpBackend.expectGET('/backend/api/currentUser/profile').respond(userResponse);

    gateway.getCurrentUser().then(user => {
      expect(user).toEqual(new User(userResponse.result));
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of users', done => {
    const usersResponse = {
      result: {
        users: [
          {id: 'me', email: 'foo@bar.baz'},
          {id: 'you', email: 'blub@blib.blab'},
        ],
      },
    };

    $httpBackend.expectGET('/backend/api/organisation/ORGANISATION-ID/users').respond(usersResponse);

    gateway.getUsers().then(users => {
      expect(users).toEqual(usersResponse.result.users.map(user => new User(user)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load a list of users of all organisations', done => {
    const usersResponse = {
      result: {
        users: [
          {id: 'me', email: 'foo@bar.baz'},
          {id: 'you', email: 'blub@blib.blab'},
        ],
      },
    };

    $httpBackend.expectGET('/backend/api/user').respond(usersResponse);

    gateway.getUserOfAllOrganisations().then(users => {
      expect(users).toEqual(usersResponse.result.users.map(user => new User(user)));
      done();
    });

    $httpBackend.flush();
  });

  it('should load information for a single user', done => {
    const userResponse = {
      result: {
        user: {
          id: 'USER_ID',
          email: 'foo@bar.baz',
          organisations: ['organisation-id'],
        },
        organisations: [
          new Organisation({
            id: 'organisation-id',
            name: 'organisation 1',
          }),
        ],
      },
    };

    const expectedUser = new User({
      id: 'USER_ID',
      email: 'foo@bar.baz',
      organisations: [new Organisation({
        id: 'organisation-id',
        name: 'organisation 1',
      })],
    });

    $httpBackend.expectGET('/backend/api/user/USER_ID').respond(userResponse);

    gateway.getUser('USER_ID').then(user => {
      expect(user).toEqual(expectedUser);
      done();
    });

    $httpBackend.flush();
  });

  it('should create a new user', done => {
    const user = {username: 'me', email: 'foo@bar.baz', password: 'foobar'};
    const userResponse = {
      result: {
        user: {id: 23, username: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectPOST('/backend/api/user').respond(userResponse);

    gateway.createUser(user).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    $httpBackend.flush();
  });

  it('should update a user', done => {
    const updatedUser = {id: 23, username: 'me', email: 'blub@blib.blab'};
    const userResponse = {
      result: {
        user: updatedUser,
      },
    };

    $httpBackend.expectPUT('/backend/api/user/23').respond(userResponse);

    gateway.updateUser(updatedUser).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    $httpBackend.flush();
  });

  it('should update a users password', done => {
    const user = {id: 23, username: 'me', email: 'foo@bar.baz', password: 'foobar'};
    const userResponse = {
      result: {
        user: {id: 23, username: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectPUT('/backend/api/user/23').respond(userResponse);

    gateway.updateUser(user).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    $httpBackend.flush();
  });

  it('should delete a user', done => {
    const userId = 23;
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectDELETE('/backend/api/user/23').respond(userResponse);

    gateway.deleteUser(userId).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    $httpBackend.flush();
  });

  it('should update currentUsers password', done => {
    const oldPassword = 'password';
    const newPassword = '123456';
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPUT('/backend/api/currentUser/password').respond(userResponse);

    gateway.setCurrentUserPassword(oldPassword, newPassword).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    $httpBackend.flush();
  });

  it('should return the users permissions', done => {
    const userResponse = {
      result: {
        'canViewStats': true,
        'canViewUserList': true,
        'canViewVideoUploadButton': true,
      },
    };

    $httpBackend.expectGET('/backend/api/currentUser/permissions').respond(userResponse);

    gateway.getCurrentUserPermissions().then(result => {
      expect(result).toEqual(userResponse.result);
      done();
    });

    $httpBackend.flush();
  });
});
