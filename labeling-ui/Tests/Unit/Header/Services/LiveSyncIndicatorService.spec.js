import LiveSyncIndicatorService from 'Application/Header/Services/LiveSyncIndicatorService';

describe('LiveSyncIndicatorService', () => {
  let liveSyncIndicatorService;
  let registeredListeners;
  let pouchDbSyncManager;

  function callRegisteredListeners(eventName, ...args) {
    registeredListeners[eventName].forEach(listenerFn => listenerFn(...args));
  }

  beforeEach(() => {
    registeredListeners = {
      alive: [],
      offline: [],
      transfer: [],
    };
    pouchDbSyncManager = jasmine.createSpyObj(['on']);
    pouchDbSyncManager.on.and.callFake((eventName, listenerFn) => registeredListeners[eventName].push(listenerFn));

    liveSyncIndicatorService = new LiveSyncIndicatorService(pouchDbSyncManager);
  });


  it('should instantiate', () => {
    expect(liveSyncIndicatorService).toEqual(jasmine.any(LiveSyncIndicatorService));
  });

  it('should emit the correct icon on pouchdb alive events', () => {
    const iconChange = jasmine.createSpy('syncstate:updated');

    liveSyncIndicatorService.on('syncstate:updated', iconChange);
    callRegisteredListeners('alive');

    expect(iconChange).toHaveBeenCalledWith('signal', 'Connection to the server established, no data to transfer');
  });

  it('should emit the correct icon on pouchdb offline events', () => {
    const iconChange = jasmine.createSpy('syncstate:updated');

    liveSyncIndicatorService.on('syncstate:updated', iconChange);
    callRegisteredListeners('offline');

    expect(iconChange).toHaveBeenCalledWith('chain-broken', 'There is currently no connection to the server');
  });

  it('should emit the correct icon on pouchdb transfer events', () => {
    const iconChange = jasmine.createSpy('syncstate:updated');

    liveSyncIndicatorService.on('syncstate:updated', iconChange);
    callRegisteredListeners('transfer');

    expect(iconChange).toHaveBeenCalledWith('exchange', 'Data is synced with the server');
  });
});
