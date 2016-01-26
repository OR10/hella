import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import UserGateway from 'Application/Users/Gateways/UserGateway';
import User from 'Application/Users/Models/User';

describe('UserGateway', () => {
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
      gateway = $injector.instantiate(UserGateway);
    });
  });

  it('should be instantiatable', () => {
    expect(gateway instanceof UserGateway).toBe(true);
  });

  it('should load information for the currently logged in user', (done) => {
    const userResponse = {
      result: {id: 'me', email: 'foo@bar.baz'},
    };

    $httpBackend.expectGET('/backend/api/user/profile').respond(userResponse);

    gateway.getCurrentUser().then((user) => {
      expect(user).toEqual(new User(userResponse.result));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should load a list of users', (done) => {
    const usersResponse = {
      result: {
        users: [
          {id: 'me', email: 'foo@bar.baz'},
          {id: 'you', email: 'blub@blib.blab'},
        ],
      }
    };

    $httpBackend.expectGET('/backend/api/users').respond(usersResponse);

    gateway.getUsers().then((users) => {
      expect(users).toEqual(usersResponse.result.users.map(user => new User(user)));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should load information for a single user', (done) => {
    const userResponse = {
      result: {
        user: {id: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectGET('/backend/api/users/me').respond(userResponse);

    gateway.getUser('me').then((user) => {
      expect(user).toEqual(new User(userResponse.result.user));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should create a new user', (done) => {
    const user = {username: 'me', email: 'foo@bar.baz', password: 'foobar'};
    const userResponse = {
      result: {
        user: {id: 23, username: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectPOST('/backend/api/users').respond(userResponse);

    gateway.createUser(user).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should update a user', (done) => {
    const user = {id: 'me', email: 'foo@bar.baz'};
    const userResponse = {
      result: {
        user: {id: 23, username: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectPUT('/backend/api/users/me').respond(userResponse);

    gateway.updateUser(user).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should update a users password', (done) => {
    const user = {id: 'me', email: 'foo@bar.baz', password: 'foobar'};
    const userResponse = {
      result: {
        user: {id: 23, username: 'me', email: 'foo@bar.baz'},
      },
    };

    $httpBackend.expectPUT('/backend/api/users/me').respond(userResponse);

    gateway.updateUser(user).then(result => {
      expect(result).toEqual(new User(userResponse.result.user));
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should delete a user', (done) => {
    const userId = 'me';
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectDELETE('/backend/api/users/me').respond(userResponse);

    gateway.deleteUser(userId).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should update currentUsers password', (done) => {
    const oldPassword = 'password';
    const newPassword = '123456';
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPUT('/backend/api/user/password').respond(userResponse);

    gateway.setPassword(oldPassword, newPassword).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should return the users permissions', (done) => {
    const userResponse = {
      result: {
        'canViewStatsButton': true,
        'canViewUserListButton': true,
        'canViewVideoUploadButton': true,
      },
    };

    $httpBackend.expectGET('/backend/api/user/permissions').respond(userResponse);

    gateway.getPermissions().then(result => {
      expect(result).toEqual(userResponse.result);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });
});
