import 'jquery';
import 'angular';
import {module, inject} from 'angular-mocks';

import AbortablePromiseProvider from 'Application/Common/Support/AbortablePromiseProvider';

describe('AbortablePromise', () => {
  let abortable;
  let $q;
  let $rootScope;

  beforeEach(() => {
    inject($injector => {
      const provider = $injector.instantiate(AbortablePromiseProvider);
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
});
