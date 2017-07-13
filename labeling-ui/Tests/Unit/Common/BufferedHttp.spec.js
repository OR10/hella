import 'jquery';
import angular from 'angular';
import {module, inject} from 'angular-mocks';

import AbortablePromise from 'Application/Common/Support/AbortablePromise';
import Common from 'Application/Common/Common';

describe('BufferedHttp', () => {
  let $rootScope;
  let bufferedHttp;
  let revisionManager;
  let $http;
  let $httpDefers;
  let $q;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular, {});
    module('AnnoStation.Common');

    revisionManager = {
      injectRevision: jasmine.createSpy('injectRevision'),
      extractRevision: jasmine.createSpy('extractRevision'),
    };

    $http = jasmine.createSpy('$http').and.callFake(() => {
      const defer = $q.defer();
      $httpDefers.push(defer);
      return defer.promise;
    });

    module($provide => {
      $provide.value('revisionManager', revisionManager);
      $provide.value('$http', $http);
      $provide.value('applicationConfig', {
        Common: {
          apiPrefix: '/api',
          backendPrefix: '/backend',
        },
      });
    });

    inject($injector => {
      bufferedHttp = $injector.get('bufferedHttp');
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
    });

    $httpDefers = [];
  });

  describe('Provider', () => {
    it('should correctly provide the bufferedHttp implementation', () => {
      expect(typeof bufferedHttp).toBe('function');
    });

    using([
      ['get', 1],
      ['head', 1],
      ['delete', 1],
      ['jsonp', 1],
      ['post', 2],
      ['put', 2],
      ['patch', 2],
    ], (alias, arity) => {
      it('should create alias function', () => {
        expect(bufferedHttp[alias]).not.toBeNull();
        expect(typeof bufferedHttp[alias]).toBe('function');
        expect(bufferedHttp[alias].length).toBe(arity);
      });

      it('should throw an error if string is given as options value', () => {
        if (arity === 1) {
          expect(() => bufferedHttp[alias]('http://example.com/', 'string-which-shouldnt-be-here')).toThrow();
        } else {
          expect(() => bufferedHttp[alias]('http://example.com/', {}, 'string-which-shouldnt-be-here')).toThrow();
        }
      });
    });
  });

  it('should proxy calls to $http', () => {
    bufferedHttp({method: 'GET', url: 'http://example.com'});
    $httpDefers[0].resolve();

    $rootScope.$digest();
    expect($http).toHaveBeenCalled();
  });

  it('should proxy calls to $http with correct values', () => {
    const expectedOptions = {method: 'GET', url: 'http://example.com'};

    bufferedHttp(expectedOptions);
    $httpDefers[0].resolve();

    $rootScope.$digest();
    expect($http).toHaveBeenCalledWith(expectedOptions);
  });

  it('should return promise', () => {
    const result = bufferedHttp({method: 'GET', url: 'http://example.com'});
    expect(typeof result.then).toBe('function');
    expect(typeof result.finally).toBe('function');
    expect(typeof result.catch).toBe('function');
  });

  it('should return AbortablePromise', () => {
    const result = bufferedHttp({method: 'GET', url: 'http://example.com'});
    expect(result instanceof AbortablePromise).toBeTruthy();
  });

  it('should resolve returned promise with $http result', () => {
    const expectedResponse = {result: ['foo', 'bar']};
    const spy = jasmine.createSpy();
    bufferedHttp({}).then(spy);
    $httpDefers[0].resolve(expectedResponse);

    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(expectedResponse);
  });

  it('should reject returned promise with $http error', () => {
    const expectedResponse = new Error('foo bar');
    const spy = jasmine.createSpy();
    bufferedHttp({}).catch(spy);
    $httpDefers[0].reject(expectedResponse);

    $rootScope.$digest();
    expect(spy).toHaveBeenCalledWith(expectedResponse);
  });

  it('should parallelize non destructive http requests', () => {
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');

    expect($http.calls.count()).toBe(3);
  });

  it('should parallelize non destructive http requests on non default queue', () => {
    bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
    bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
    bufferedHttp.get('http://foo.bar/baz', undefined, 'foobar');
    $rootScope.$digest();

    expect($http.calls.count()).toBe(3);
  });

  it('should serialize destructive http requests', () => {
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
    expect($http.calls.count()).toBe(1);
    $httpDefers[0].resolve();
    $rootScope.$digest();
    expect($http.calls.count()).toBe(2);
    $httpDefers[1].resolve();
    $rootScope.$digest();
    expect($http.calls.count()).toBe(3);
    $httpDefers[2].resolve();
    $rootScope.$digest();
  });

  it('should serialize destructive http requests on non default queue', () => {
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
    expect($http.calls.count()).toBe(1);
    $httpDefers[0].resolve();
    $rootScope.$digest();
    expect($http.calls.count()).toBe(2);
    $httpDefers[1].resolve();
    $rootScope.$digest();
    expect($http.calls.count()).toBe(3);
    $httpDefers[2].resolve();
    $rootScope.$digest();
  });

  it('should wait with non destructive operations until destructives are finished', () => {
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'});
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');
    expect($http.calls.count()).toBe(2);
    $httpDefers[0].resolve(); $rootScope.$digest();
    expect($http.calls.count()).toBe(2);
    $httpDefers[1].resolve(); $rootScope.$digest();
    expect($http.calls.count()).toBe(3);
    $httpDefers[2].resolve(); $rootScope.$digest();
    expect($http.calls.count()).toBe(4);
    $httpDefers[3].resolve(); $rootScope.$digest();
    expect($http.calls.count()).toBe(6);
    $httpDefers[4].resolve(); $httpDefers[5].resolve(); $rootScope.$digest();
  });

  it('should parallelize destructive operations on multiple queues', () => {
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blub');
    bufferedHttp.post('http://foo.bar/baz', {foo: 'bar'}, undefined, 'blib');
    expect($http.calls.count()).toBe(2);
    $httpDefers[0].resolve();
    $httpDefers[1].resolve();
    $rootScope.$digest();
  });

  // @TODO: More tests needed here
  // - usage of entityManager
  // - deferred timeout injection
});
