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
  let $httpDeferred;
  let $q;

  beforeEach(() => {
    const commonModule = new Common();
    commonModule.registerWithAngular(angular);
    module('AnnoStation.Common');

    revisionManager = {
      injectRevision: jasmine.createSpy('injectRevision'),
      extractRevision: jasmine.createSpy('extractRevision'),
    };

    $http = jasmine.createSpy('$http').and.callFake(() => $httpDeferred.promise);

    module(($provide, bufferedHttpProvider) => {
      $provide.value('revisionManager', revisionManager);
      $provide.value('$http', $http);

      bufferedHttpProvider.enableFlushFunctionality();
    });

    inject($injector => {
      bufferedHttp = $injector.get('bufferedHttp');
      $rootScope = $injector.get('$rootScope');
      $q = $injector.get('$q');
    });

    $httpDeferred = $q.defer();
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
    });
  });

  it('should proxy calls to $http', (done) => {
    bufferedHttp({method: 'GET', url: 'http://example.com'});
    $httpDeferred.resolve();

    bufferedHttp.flushBuffers().then(() => {
      $rootScope.$digest();
      expect($http).toHaveBeenCalled();
      done();
    });
  });

  it('should proxy calls to $http with correct values', (done) => {
    const expectedOptions = {method: 'GET', url: 'http://example.com'};

    bufferedHttp(expectedOptions);
    $httpDeferred.resolve();

    bufferedHttp.flushBuffers().then(() => {
      $rootScope.$digest();
      expect($http).toHaveBeenCalledWith(expectedOptions);
      done();
    });
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

  it('should resolve returned promise with $http result', (done) => {
    const expectedResponse = {result: ['foo', 'bar']};
    const spy = jasmine.createSpy();
    bufferedHttp({}).then(spy);
    $httpDeferred.resolve(expectedResponse);

    bufferedHttp.flushBuffers().then(() => {
      $rootScope.$digest();
      expect(spy).toHaveBeenCalledWith(expectedResponse);
      done();
    });
  });

  it('should reject returned promise with $http error', (done) => {
    const expectedResponse = new Error('foo bar');
    const spy = jasmine.createSpy();
    bufferedHttp({}).catch(spy);
    $httpDeferred.reject(expectedResponse);

    bufferedHttp.flushBuffers().then(() => {
      $rootScope.$digest();
      expect(spy).toHaveBeenCalledWith(expectedResponse);
      done();
    });
  });

  it('should parallelize non destructive http requests', () => {
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');
    bufferedHttp.get('http://foo.bar/baz');

    expect($http.calls.count()).toBe(3);
  });

  // @TODO: More tests needed here
  // - buffering
  // - usage of entityManager
  // - deferred timeout injection
});
