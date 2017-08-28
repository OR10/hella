const PromiseMock = require('promise-mock');
const { ReplicationManager } = require('../Application/ReplicationManager');

describe('ReplicationManager', () => {
  let nanoAdminMock;
  let replicatorDbMock;
  let loggerMock;
  let workerQueueMock;
  let compactionServiceMock;
  let purgeServiceMock;
  let debugInterfaceMock;

  function getOptions() {
    return {
      adminUrl: 'http://admin:bar@127.0.0.1:5984/',
      sourceBaseUrl: 'http://admin:bar@127.0.0.1:5984/',
      targetBaseUrl: 'http://admin:bar@127.0.0.1:5984/',
      sourceDbRegex: '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)',
      targetDb: 'labeling_api_read_only',
    };
  }

  function createReplicationManager() {
    return new ReplicationManager(
      loggerMock,
      nanoAdminMock,
      workerQueueMock,
      purgeServiceMock,
      debugInterfaceMock,
      getOptions()
    );
  }

  beforeEach(() => {
    PromiseMock.install();
  });

  beforeEach(() => {
    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);
    loggerMock = jasmine.createSpyObj('Logger', ['logString']);
    workerQueueMock = jasmine.createSpyObj('WorkerQueue', ['listenToReplicationChanges']);
    purgeServiceMock = jasmine.createSpyObj('PurgeService', ['purgeDocument']);
    debugInterfaceMock = jasmine.createSpyObj('DebugInterface', ['initialize', 'on', 'writeJson']);

    debugInterfaceMock.initialize.and.returnValue(Promise.resolve());
    debugInterfaceMock.writeJson.and.returnValue(Promise.resolve());

    purgeServiceMock.purgeDocument.and.returnValue(Promise.resolve());

    nanoAdminMock = {
      db: {
        list: jasmine.createSpy().and.returnValue({
          err: undefined,
          body: ['taskdb-project-52f18aa62197594438469fe88001ca0d-task-52f18aa62197594438469fe8800e5ae2'],
        }),
      },
      use: jasmine.createSpy().and.returnValue(replicatorDbMock),
    };
  });

  it('should instantiate', () => {
    const replicationManager = createReplicationManager();
    expect(replicationManager).toEqual(jasmine.any(ReplicationManager));
  });

  it('should purging old replications return a promise', () => {
    const replicationManager = createReplicationManager();
    expect(
      replicationManager.purgeAllPreviousManagedReplicationLeftOvers(),
    ).toEqual(
      jasmine.any(Promise),
    );
  });

  it('should trigger startup', () => {
    const replicationManager = createReplicationManager();
    workerQueueMock.listenToReplicationChanges
      .and.returnValue(Promise.resolve());

    spyOn(replicationManager, 'purgeAllPreviousManagedReplicationLeftOvers')
      .and.returnValue(Promise.resolve());
    spyOn(replicationManager, 'addOneTimeReplicationForAllDatabases')
      .and.returnValue(Promise.resolve());
    spyOn(replicationManager, 'listenToDatabaseChanges')
      .and.returnValue(Promise.resolve());

    replicationManager.run();

    Promise.runAll();

    expect(replicationManager.purgeAllPreviousManagedReplicationLeftOvers).toHaveBeenCalled();
    expect(replicationManager.addOneTimeReplicationForAllDatabases).toHaveBeenCalled();
    expect(workerQueueMock.listenToReplicationChanges).toHaveBeenCalled();
    expect(replicationManager.listenToDatabaseChanges).toHaveBeenCalled();
  });

  afterEach(() => {
    PromiseMock.uninstall();
  });
});
