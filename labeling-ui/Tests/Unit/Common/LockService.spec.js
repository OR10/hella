import 'jquery';
import 'angular';
import {inject} from 'angular-mocks';

import LockService from 'Application/Common/Services/LockService';

describe('LockService', () => {
  let lockService;
  let $rootScope;
  let $timeout;

  beforeEach(() => {
    inject($injector => {
      lockService = $injector.instantiate(LockService);
      $rootScope = $injector.get('$rootScope');
      $timeout = $injector.get('$timeout');
    });
  });

  it('should be able to instantiate without non injected arguments', () => {
    expect(lockService instanceof LockService).toEqual(true);
  });

  it('should defer execution of an operation until the resource is available', () => {
    const operations = {
      first: release => $timeout(release, 0),
      second: release => release(),
    };

    spyOn(operations, 'first').and.callThrough();
    spyOn(operations, 'second').and.callThrough();

    const resource = 'test-lock-id';

    lockService.acquire(resource, operations.first);
    lockService.acquire(resource, operations.second);

    // This is required to set off the initial lock promise
    $rootScope.$digest();

    expect(operations.first.calls.count()).toBe(1);
    expect(operations.second.calls.any()).toBe(false);

    // Flush timeouts, completing the first operation and releasing the lock
    $timeout.flush();

    expect(operations.first.calls.count()).toBe(1);
    expect(operations.second.calls.count()).toBe(1);
  });

  it('should not defer execution of operations on different resources', () => {
    const operations = {
      first: release => $timeout(release, 0),
      second: release => release(),
    };

    spyOn(operations, 'first').and.callThrough();
    spyOn(operations, 'second').and.callThrough();

    const firstResource = 'test-lock-id';
    const secondResource = 'another-lock-id';

    lockService.acquire(firstResource, operations.first);
    lockService.acquire(secondResource, operations.second);

    // This is required to set off the initial lock promise
    $rootScope.$digest();

    expect(operations.first.calls.count()).toBe(1);
    expect(operations.second.calls.count()).toBe(1);
  });
});
