const { WorkerQueue } = require('../Application/WorkerQueue');
const { Replicator } = require('../Application/Jobs/Replicator');
const md5 = require('md5');

describe('WorkerQueue', () => {
  let nanoAdminMock;
  let replicatorDbMock;
  let loggerMock;
  let compactionServiceMock;
  let purgeServiceMock;

  function createWorkerQueue() {
    return new WorkerQueue(nanoAdminMock, loggerMock, compactionServiceMock, 50, 500);
  }

  function createReplicationJob(sourceBaseUrl = 'http://example.com', sourceDatabase = 'some-database', targetUrl = 'http://some-other.couch:5984/foobar-db') {
    return new Replicator(loggerMock, nanoAdminMock, purgeServiceMock, sourceBaseUrl, sourceDatabase, targetUrl);
  }

  beforeEach(() => {
    nanoAdminMock = jasmine.createSpyObj('nanoAdmin', ['use']);
    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);
    loggerMock = jasmine.createSpyObj('Logger', ['logString']);
    compactionServiceMock = jasmine.createSpyObj('CompactionService', ['compactDb', 'isCompactionInProgress']);
    compactionServiceMock.isCompactionInProgress.and.returnValue(false);
    compactionServiceMock.compactDb.and.returnValue(Promise.resolve());

    purgeServiceMock = jasmine.createSpyObj('PurgeService', ['purgeDocument']);
    purgeServiceMock.purgeDocument.and.returnValue(Promise.resolve());

    nanoAdminMock.use.and.returnValue(replicatorDbMock);
  });

  it('should instantiate', () => {
    const workerQueue = createWorkerQueue();
    expect(workerQueue).toEqual(jasmine.any(WorkerQueue));
  });

  it('should add job to worker queue', () => {
    const workerQueue = createWorkerQueue();
    spyOn(workerQueue, 'doWork').and.returnValue(undefined);
    const job = createReplicationJob();

    workerQueue.addJob(job);
    expect(workerQueue.queue.length).toEqual(1);
  });

  it('should delete jobs by id', () => {
    const workerQueue = createWorkerQueue();
    spyOn(workerQueue, 'doWork').and.returnValue(undefined);

    const firstJob = createReplicationJob('http://some.couch', 'source-one', 'target-one');
    const secondJob = createReplicationJob('http://some.couch', 'source-two', 'target-two');
    const thirdJob = createReplicationJob('http://some.couch', 'source-three', 'target-three');

    workerQueue.addJob(firstJob);
    workerQueue.addJob(secondJob);
    workerQueue.addJob(thirdJob);

    const idOfSecondJob = `replication-manager-${md5('http://some.couch/source-twotarget-two')}`;
    workerQueue.removeJob(idOfSecondJob);

    expect(workerQueue.queue.length).toEqual(2);
    expect(workerQueue.queue).toEqual([firstJob, thirdJob]);
  });

  it('should add duplicate job to worker queue', () => {
    const workerQueue = createWorkerQueue();
    spyOn(workerQueue, 'doWork').and.returnValue(undefined);
    const job = createReplicationJob();

    workerQueue.addJob(job);
    workerQueue.addJob(job);

    expect(workerQueue.queue.length).toEqual(1);
  });

  it('should work with queues and active tasks', () => {
    const workerQueue = createWorkerQueue();
    // Eliminate setImmediate
    spyOn(workerQueue, 'doWork')
      .and.callFake(() => workerQueue.queueWorker());

    for (let count = 1; count <= 70; count++) {
      const job = createReplicationJob('http://some.couch', count, count);
      workerQueue.addJob(job);
    }

    expect(workerQueue.activeTasks.length).toEqual(50);
    expect(workerQueue.queue.length).toEqual(20);
  });

  it('should complete a worker job', done => {
    const workerQueue = createWorkerQueue();
    const job = createReplicationJob();
    const promise = new Promise(resolve => {
      resolve();
    });
    spyOn(workerQueue, 'doWork').and.returnValue(undefined);
    spyOn(job, 'run').and.returnValue(promise);

    expect(workerQueue.activeTasks.length).toEqual(0);
    expect(workerQueue.queue.length).toEqual(0);

    workerQueue.addJob(job);

    expect(workerQueue.activeTasks.length).toEqual(0);
    expect(workerQueue.queue.length).toEqual(1);

    workerQueue.queueWorker();
    expect(workerQueue.queue.length).toEqual(0);
    expect(workerQueue.activeTasks.length).toEqual(1);

    promise.then(() => {
      expect(workerQueue.activeTasks.length).toEqual(0);
      done();
    });
  });
});
