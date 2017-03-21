import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import InProgressService from 'Application/Common/Services/InProgressService';

describe('InProgressService test suite', () => {
  let inProgress;
  let windowMock;
  let rootScopeMock;

  beforeEach(() => {
    const featureFlags = {
      pouchdb: false,
    };

    const commonModule = new Common();
    commonModule.registerWithAngular(angular, featureFlags);
    module('AnnoStation.Common');

    inject(($rootScope, $window, modalService) => {
      rootScopeMock = $rootScope;
      windowMock = $window;

      inProgress = new InProgressService(rootScopeMock, windowMock, modalService);
    });
  });

  it('can be created', () => {
    expect(inProgress).toEqual(jasmine.any(InProgressService));
  });


  it('adds an event listener to the $rootScope destroy event', () => {
    spyOn(rootScopeMock, '$on');
    inProgress.start();

    expect(rootScopeMock.$on).toHaveBeenCalledWith('$stateChangeStart', jasmine.any(Function));
    expect(rootScopeMock.$on).toHaveBeenCalledWith('$destroy', jasmine.any(Function));
  });

  it('should remove eventlistners on .end() call', () => {
    spyOn(windowMock, 'removeEventListener');

    inProgress.end();

    expect(windowMock.removeEventListener).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
  });
});
