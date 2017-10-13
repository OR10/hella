import {inject} from 'angular-mocks';
import RootScopeEventRegistrationService from '../../../Application/Common/Services/RootScopeEventRegistrationService';

describe('RootScopeEventRegistrationService', () => {
  let rootScopeMock;

  function createService() {
    return new RootScopeEventRegistrationService(
      rootScopeMock
    );
  }

  beforeEach(() => {
    rootScopeMock = jasmine.createSpyObj('$rootScope', ['$on']);
  });

  it('should instantiate', () => {
    const service = createService();
    expect(service).toEqual(jasmine.any(RootScopeEventRegistrationService));
  });

  it('should register events on the rootScope', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(rootScopeMock.$on).toHaveBeenCalledWith(someEvent, someHandler);
  });

  it('should track registered events by their eventName', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(service.isTracking(someIdentifier, someEvent)).toBeTruthy();
  });

  it('should answer tracking questing with false for unknown events of same identifier', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someOtherEvent = 'some:not:so:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(service.isTracking(someIdentifier, someOtherEvent)).toBeFalsy();
  });

  it('should answer tracking question with false for unknown identifiers', () => {
    const service = createService();
    const someIdentifier = {};
    const someOtherIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(service.isTracking(someOtherIdentifier, someEvent)).toBeFalsy();
  });

  it('should track events by their identifier', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(service.isTracking(someIdentifier)).toBeTruthy();
  });

  it('should answer tracking question with false for different identifiers without event name', () => {
    const service = createService();
    const someIdentifier = {};
    const someOtherIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');

    service.register(someIdentifier, someEvent, someHandler);

    expect(service.isTracking(someOtherIdentifier)).toBeFalsy();
  });

  it('should deregister events before they are registered again', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someHandler = jasmine.createSpy('event handler');
    const someOtherHandler = jasmine.createSpy('another event handler');

    const deregisterFunction = jasmine.createSpy('deregister event');
    rootScopeMock.$on.and.returnValue(deregisterFunction);

    service.register(someIdentifier, someEvent, someHandler);
    service.register(someIdentifier, someEvent, someOtherHandler);

    expect(deregisterFunction).toHaveBeenCalled();
    expect(rootScopeMock.$on).toHaveBeenCalledTimes(2);
    expect(rootScopeMock.$on).toHaveBeenCalledWith(someEvent, someOtherHandler);
  });

  it('should deregister specific events', () => {
    const service = createService();
    const someIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someOtherEvent = 'some:not:so:interesting:event';
    const someHandler = jasmine.createSpy('event handler');
    const someOtherHandler = jasmine.createSpy('another event handler');

    const deregisterFunctionForSomeEvent = jasmine.createSpy('deregister someEvent');
    const deregisterFunctionForSomeOtherEvent = jasmine.createSpy('deregister someOtherEvent');
    rootScopeMock.$on.and.callFake((eventName, handler) => {
      switch (true) {
        case eventName === someEvent:
          return deregisterFunctionForSomeEvent;
        case eventName === someOtherEvent:
          return deregisterFunctionForSomeOtherEvent;
        default:
          throw new Error(`Unknown Event: ${eventName}`);
      }
    });

    service.register(someIdentifier, someEvent, someHandler);
    service.register(someIdentifier, someOtherEvent, someOtherHandler);

    service.deregister(someIdentifier, someEvent);

    expect(deregisterFunctionForSomeEvent).toHaveBeenCalled();
    expect(deregisterFunctionForSomeOtherEvent).not.toHaveBeenCalled();
  });

  it('should deregister complete identifier sets', () => {
    const service = createService();
    const someIdentifier = {};
    const someOtherIdentifier = {};
    const someEvent = 'some:interesting:event';
    const someOtherEvent = 'some:not:so:interesting:event';
    const anIncredibleEvent = 'some:incredible:event';
    const someHandler = jasmine.createSpy('event handler');
    const someOtherHandler = jasmine.createSpy('another event handler');

    const deregisterFunctionForSomeEvent = jasmine.createSpy('deregister someEvent');
    const deregisterFunctionForSomeOtherEvent = jasmine.createSpy('deregister someOtherEvent');
    const deregisterFunctionForAnIncredibleEvent = jasmine.createSpy('deregister anIncredibleEvent');
    rootScopeMock.$on.and.callFake(eventName => {
      switch (true) {
        case eventName === someEvent:
          return deregisterFunctionForSomeEvent;
        case eventName === someOtherEvent:
          return deregisterFunctionForSomeOtherEvent;
        case eventName === anIncredibleEvent:
          return deregisterFunctionForAnIncredibleEvent;
        default:
          throw new Error(`Unknown Event: ${eventName}`);
      }
    });

    service.register(someIdentifier, someEvent, someHandler);
    service.register(someIdentifier, someOtherEvent, someOtherHandler);
    service.register(someOtherIdentifier, anIncredibleEvent, someHandler);

    service.deregister(someIdentifier);

    expect(deregisterFunctionForSomeEvent).toHaveBeenCalled();
    expect(deregisterFunctionForSomeOtherEvent).toHaveBeenCalled();
    expect(deregisterFunctionForAnIncredibleEvent).not.toHaveBeenCalled();
  });
});
