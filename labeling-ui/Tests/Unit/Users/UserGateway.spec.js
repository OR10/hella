import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import UserGateway from 'Application/Users/Gateways/UserGateway';

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
      expect(users).toEqual(usersResponse.result.users);
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
      expect(user).toEqual(userResponse.result.user);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should create a new user', (done) => {
    const user = {id: 'me', email: 'foo@bar.baz'};
    const userResponse = {
      result: {
        success: true
      },
    };

    $httpBackend.expectPOST('/backend/api/users').respond(userResponse);

    gateway.createUser(user).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should create a new user', (done) => {
    const user = {email: 'foo@bar.baz'};
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPOST('/backend/api/users').respond(userResponse);

    gateway.createUser(user).then(result => {
      expect(result).toEqual(userResponse.result.success);
      done();
    });

    bufferedHttp.flushBuffers().then(() => $httpBackend.flush());
  });

  it('should update a user', (done) => {
    const user = {id: 'me', email: 'foo@bar.baz'};
    const userResponse = {
      result: {
        success: true,
      },
    };

    $httpBackend.expectPUT('/backend/api/users/me').respond(userResponse);

    gateway.updateUser(user).then(result => {
      expect(result).toEqual(userResponse.result.success);
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
});
