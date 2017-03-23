import angular from 'angular';
import {module, inject} from 'angular-mocks';
import Common from 'Application/Common/Common';

import InProgressService from 'Application/Common/Services/InProgressService';

describe('InProgressService test suite', () => {
  let inProgress;
  let windowMock;
  let rootScopeMock;
  let modalServiceMock;

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
      modalServiceMock = modalService;

      inProgress = new InProgressService(rootScopeMock, windowMock, modalService);
    });
  });

  it('can be created', () => {
    expect(inProgress).toEqual(jasmine.any(InProgressService));
  });

  describe('start()', () => {
    beforeEach(() => {
      // Always spy on addEventListener, otherwise you will be prompted to really leave the page
      // at every test run
      spyOn(windowMock, 'addEventListener');
    });

    it('adds an event listener to beforeunload', () => {
      inProgress.start();

      expect(windowMock.addEventListener).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
    });

    it('adds an event listener to the $rootScope destroy event', () => {
      spyOn(rootScopeMock, '$on');

      inProgress.start();

      expect(rootScopeMock.$on).toHaveBeenCalledWith('$stateChangeStart', jasmine.any(Function));
      expect(rootScopeMock.$on).toHaveBeenCalledWith('$destroy', jasmine.any(Function));
    });

    it('adds an event listener to the $rootScope $stateChangeStart event', () => {
      spyOn(rootScopeMock, '$on');

      inProgress.start();

      expect(rootScopeMock.$on).toHaveBeenCalledWith('$stateChangeStart', jasmine.any(Function));
    });
  });

  describe('end()', () => {
    it('removes the beforeunload event listener', () => {
      spyOn(windowMock, 'removeEventListener');

      inProgress.end();

      expect(windowMock.removeEventListener).toHaveBeenCalledWith('beforeunload', jasmine.any(Function));
    });

    it('removes the navigation intercepter', () => {
      spyOn(windowMock, 'addEventListener');

      inProgress.start();
      spyOn(inProgress, '_uninstallNavigationInterceptor');
      expect(inProgress._uninstallNavigationInterceptor).not.toBeNull();
      inProgress.end();

      expect(inProgress._uninstallNavigationInterceptor).toBeNull();
    });
  });

  describe('noActiveNavigationInterceptor', () => {
    beforeEach(() => {
      spyOn(window, 'addEventListener');
    });

    it('is true by default', () => {
      const actual = inProgress.noActiveNavigationInterceptor();
      expect(actual).toBe(true);
    });

    it('is false if there is one interceptor', () => {
      inProgress.start();
      const actual = inProgress.noActiveNavigationInterceptor();
      expect(actual).toBe(false);
    });

    it('is true if there was one interceptor, but it has been stopped', () => {
      inProgress.start();
      inProgress.end();
      const actual = inProgress.noActiveNavigationInterceptor();
      expect(actual).toEqual(true);
    });
  });

  describe('events', () => {
    describe('onunload', () => {
      let beforeUnloadCallback;

      beforeEach(() => {
        spyOn(windowMock, 'addEventListener').and.callFake((event, callback) => {
          if (event === 'beforeunload') {
            beforeUnloadCallback = callback;
          }
        });
      });

      it('returns a message', () => {
        const event = {};
        inProgress.start();
        const message = beforeUnloadCallback(event);
        expect(message).toEqual(jasmine.any(String));
      });

      it('sets the returnValue of the event, which is the same as the returned message', () => {
        const event = {returnValue: 'blablubb'};
        inProgress.start();
        const message = beforeUnloadCallback(event);
        expect(event.returnValue).toEqual(message);
      });
    });

    describe('$stateChangeStart', () => {
      const to = { redirectTo: ''};
      let stateMock;

      // In order for the following tests to work, we need the inProgressService that
      // is injected, otherwise we cannot prevent $state.go in Common.js
      beforeEach(inject(($state, inProgressService) => {
        inProgress = inProgressService;
        stateMock = $state;

        spyOn(stateMock, 'go');
      }));

      beforeEach(() => {
        spyOn(windowMock, 'addEventListener');
      });

      it('prevents the default and does not call state.go', () => {
        inProgress.start();
        rootScopeMock.$emit('$stateChangeStart', to);
        expect(stateMock.go).not.toHaveBeenCalled();
      });

      it('shows a modal window with the given message', () => {
        const message = 'Kevin allein zu Haus';
        spyOn(modalServiceMock, 'info');
        inProgress.start(message);

        rootScopeMock.$emit('$stateChangeStart', to);
        const actualMessage = modalServiceMock.info.calls.argsFor(0)[0].message;

        expect(modalServiceMock.info).toHaveBeenCalled();
        expect(actualMessage).toEqual(message);
      });
    });
  });
});
