const { ReplicationManager } = require('../Application/ReplicationManager');

describe('ReplicationManager Test', () => {
  let nanoAdminMock;
  let replicatorDbMock;
  let loggerMock;
  let workerQueueMock;

  function getOptions() {
    return {
      'adminUrl': 'http://admin:bar@127.0.0.1:5984/',
      'sourceBaseUrl': 'http://admin:bar@127.0.0.1:5984/',
      'targetBaseUrl': 'http://admin:bar@127.0.0.1:5984/',
      'sourceDbRegex': '(taskdb-project-)([a-z0-9_-]+)(-task-)([a-z0-9_-]+)',
      'targetDb': 'labeling_api_read_only',
    };
  }

  function createReplicationManager() {
    return new ReplicationManager(loggerMock, nanoAdminMock, workerQueueMock, getOptions());
  }

  beforeEach(() => {
    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);
    loggerMock = jasmine.createSpyObj('Logger', ['logString']);
    workerQueueMock = jasmine.createSpyObj('WorkerQueue', ['listenToReplicationChanges']);

    nanoAdminMock = {
      'db': {
        list: jasmine.createSpy().and.returnValue({
          'err': undefined,
          'body': ['taskdb-project-52f18aa62197594438469fe88001ca0d-task-52f18aa62197594438469fe8800e5ae2'],
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

  it('should trigger startup', done => {
    const replicationManager = createReplicationManager();
    const promise = new Promise(resolve => {
      resolve();
    });
    spyOn(replicationManager, 'purgeAllPreviousManagedReplicationLeftOvers').and.returnValue(promise);
    spyOn(replicationManager, 'addOneTimeReplicationForAllDatabases');
    spyOn(replicationManager, 'listenToDatabaseChanges');
    replicationManager.run();

    expect(replicationManager.purgeAllPreviousManagedReplicationLeftOvers).toHaveBeenCalled();
    promise.then(() => {
      expect(replicationManager.addOneTimeReplicationForAllDatabases).toHaveBeenCalled();
      expect(workerQueueMock.listenToReplicationChanges).toHaveBeenCalled();
      expect(replicationManager.listenToDatabaseChanges).toHaveBeenCalled();
      done();
    });
  });
});
