const PromiseMock = require('promise-mock');
const {CompactionService} = require('../Application/CompactionService');

describe('CompactionService', () => {
  let nanoDbMock;
  let infoObjectMock;

  beforeEach(() => {
    PromiseMock.install();
    jasmine.clock().install();
  });

  beforeEach(() => {
    infoObjectMock = {
      compact_running: true
    };

    nanoDbMock = jasmine.createSpyObj('nanoDB', ['compact', 'info']);
    nanoDbMock.compact.and.callFake(callbackFn => callbackFn());
    nanoDbMock.info.and.callFake(callbackFn => callbackFn(undefined, infoObjectMock));
  });

  function createCompactionService() {
    return new CompactionService(nanoDbMock);
  }

  it('should be instantiable', () => {
    const service = createCompactionService();
    expect(service).toEqual(jasmine.any(CompactionService));
  });

  describe('isCompactionInProgress', () => {
    it('should tell that replication is not running if it was not triggered', () => {
      const service = createCompactionService();
      expect(service.isCompactionInProgress()).toBeFalsy();
    });

    it('should tell that replication is running after it has been started', () => {
      const service = createCompactionService();
      service.compactDb();

      Promise.runAll();

      expect(service.isCompactionInProgress()).toBeTruthy();
    });

    it('should tell that replication is finished after it has been started and completed', () => {
      const service = createCompactionService();
      service.compactDb();

      Promise.runAll();

      expect(service.isCompactionInProgress()).toBeTruthy();
      infoObjectMock.compact_running = false;

      jasmine.clock().tick(10000);
      Promise.runAll();

      expect(service.isCompactionInProgress()).toBeFalsy();
    });
  });

  describe('compactDb', () => {
    it('should return promise', () => {
      const service = createCompactionService();
      const resultValue = service.compactDb();

      expect(resultValue.then).toEqual(jasmine.any(Function));
    });

    it('should resolve promise once the replication finished', () => {
      const service = createCompactionService();

      const compactionPromiseResolved = jasmine.createSpy('compactionPromiseResolved');
      const compactionPromise = service.compactDb();
      compactionPromise.then(compactionPromiseResolved);

      Promise.runAll();

      expect(compactionPromiseResolved).not.toHaveBeenCalled();

      jasmine.clock().tick(10000);
      Promise.runAll();

      expect(compactionPromiseResolved).not.toHaveBeenCalled();

      infoObjectMock.compact_running = false;
      jasmine.clock().tick(10000);
      Promise.runAll();

      expect(compactionPromiseResolved).toHaveBeenCalled();
    });

    it('should reject the promise if an error occured initiating the compaction', () => {
      const service = createCompactionService();

      const error = 'Some nasty error!';
      nanoDbMock.compact.and.callFake(callbackFn => callbackFn(error));

      const compactionPromiseRejected = jasmine.createSpy('compactionPromiseRejected');
      const compactionPromise = service.compactDb();
      compactionPromise.catch(compactionPromiseRejected);

      Promise.runAll();

      expect(compactionPromiseRejected).toHaveBeenCalledWith(error);
    });

    it('should reject the promise if an error occured during state polling', () => {
      const service = createCompactionService();

      const error = 'Some nasty error!';
      nanoDbMock.info.and.callFake(callbackFn => callbackFn(error));

      const compactionPromiseRejected = jasmine.createSpy('compactionPromiseRejected');
      const compactionPromise = service.compactDb();
      compactionPromise.catch(compactionPromiseRejected);

      Promise.runAll();

      expect(compactionPromiseRejected).toHaveBeenCalledWith(error);
    });

    it('should immediatly fire first state polling after compaction started', () => {
      const service = createCompactionService();

      service.compactDb();

      Promise.runAll();

      expect(nanoDbMock.info).toHaveBeenCalled();
    });

    it('should sleep some time between state polling calls', () => {
      const service = createCompactionService();

      service.compactDb();

      Promise.runAll();

      expect(nanoDbMock.info).toHaveBeenCalledTimes(1);

      jasmine.clock().tick(10);
      expect(PromiseMock.waiting.length).toEqual(0);

      jasmine.clock().tick(10000);
      Promise.runAll();

      expect(nanoDbMock.info.calls.count()).toBeGreaterThan(1);
    });
  });

  afterEach(() => {
    PromiseMock.uninstall();
    jasmine.clock().uninstall();
  });
});