import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import AbortablePromiseFactoryProvider from 'Application/Common/Support/AbortablePromiseFactoryProvider';

describe('AbortablePromiseFactory', () => {
  let abortable;
  let $q;
  let $rootScope;

  beforeEach(() => {
    inject($injector => {
      const provider = $injector.instantiate(AbortablePromiseFactoryProvider);
      abortable = $injector.invoke(provider.$get);
      $q = $injector.get('$q');
      $rootScope = $injector.get('$rootScope');
    });
  });

  it('should pass through promise success', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.then(spy);
    deferred.resolve();

    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });

  it('should pass through promise error', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.catch(spy);
    deferred.reject();

    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });

  it('should pass through promise success value', () => {
    const expectedResult = 'foobar';
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.then(spy);
    deferred.resolve(expectedResult);

    $rootScope.$digest();

    expect(spy).toHaveBeenCalledWith(expectedResult);
  });

  it('should pass through promise error', () => {
    const expectedResult = 'foobar';
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.catch(spy);
    deferred.reject(expectedResult);

    $rootScope.$digest();

    expect(spy).toHaveBeenCalledWith(expectedResult);
  });

  it('should abort promise success', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.then(spy);
    wrapped.abort();
    deferred.resolve();

    $rootScope.$digest();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should resolve abortDeferred on abort', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    deferred.promise.then(spy);

    const wrapped = abortable($q.defer().promise, deferred);
    wrapped.abort();

    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });

  it('should bubble up aborts the promise chain', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const promise = deferred.promise;
    promise.abort = spy;

    const wrapped = abortable(promise);
    wrapped.abort();

    $rootScope.$digest();

    expect(spy).toHaveBeenCalled();
  });

  it('should abort promise error', () => {
    const spy = jasmine.createSpy();
    const deferred = $q.defer();
    const wrapped = abortable(deferred.promise);
    wrapped.catch(spy);
    wrapped.abort();
    deferred.reject();

    $rootScope.$digest();

    expect(spy).not.toHaveBeenCalled();
  });

  it('should work with multiple abortable promises in play', () => {
    const calledSpy = jasmine.createSpy();
    const uncalledSpy = jasmine.createSpy();
    const calledDeferred = $q.defer();
    const calledWrapped = abortable(calledDeferred.promise);
    const uncalledDeferred = $q.defer();
    const uncalledWrapped = abortable(uncalledDeferred.promise);

    calledWrapped.then(calledSpy);
    uncalledWrapped.then(uncalledSpy);

    uncalledWrapped.abort();

    calledDeferred.resolve();
    uncalledDeferred.resolve();

    $rootScope.$digest();

    expect(uncalledSpy).not.toHaveBeenCalled();
    expect(calledSpy).toHaveBeenCalled();
  });
});
