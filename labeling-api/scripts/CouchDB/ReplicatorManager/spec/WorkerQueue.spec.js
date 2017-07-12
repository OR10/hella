const { WorkerQueue } = require('../Application/WorkerQueue');
const { Replicator } = require('../Application/Jobs/Replicator');

describe('WorkerQueue Job', () => {
  let nanoAdminMock;
  let replicatorDbMock;
  let loggerMock;

  function createWorkerQueue() {
    return new WorkerQueue(nanoAdminMock, loggerMock);
  }

  function createReplicationJob(sourceUrl = '', targetUrl = '') {
    return new Replicator(nanoAdminMock, sourceUrl, targetUrl);
  }

  beforeEach(() => {
    nanoAdminMock = jasmine.createSpyObj('nanoAdmin', ['use']);
    replicatorDbMock = jasmine.createSpyObj('replicatorDb', ['insert']);
    loggerMock = jasmine.createSpyObj('Logger', ['logString']);

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
    spyOn(workerQueue, 'doWork').and.returnValue(undefined);

    for (let count = 1; count <= 70; count++) {
      const job = createReplicationJob(count, count);
      workerQueue.addJob(job);
      workerQueue.queueWorker();
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
