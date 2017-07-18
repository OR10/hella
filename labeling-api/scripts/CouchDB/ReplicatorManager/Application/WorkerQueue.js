const { compactReplicationDatabase } = require('./Utils');

class WorkerQueue {
  constructor(nanoAdmin, logger, maxSimultaneousJobs = 50, compactReplicationDbCycle = 500) {
    this.nanoAdmin = nanoAdmin;
    this.logger = logger;
    this.maxSimultaneousJobs = maxSimultaneousJobs;
    this.compactReplicationDbCycle = compactReplicationDbCycle;
    this.compactReplicationCounter = 0;
    this.queue = [];
    this.activeTasks = [];
    this.lastQueueStatus = {};
  }

  /**
   *
   * @param job
   */
  addJob(job) {
    this.queue.push(job);
    this.queue = WorkerQueue._removeDuplicatesBy(x => x.id, this.queue);
    this._printQueueStatus();

    this.doWork();
  }

  static _removeDuplicatesBy(keyFn, array) {
    const mySet = new Set();
    return array.filter(x => {
      const key = keyFn(x);
      const isNew = !mySet.has(key);
      if (isNew) {
        mySet.add(key);
      }
      return isNew;
    });
  }

  /**
   *
   */
  doWork() {
    setImmediate(() => {
      this.queueWorker();
    });
  }

  /**
   *
   * @returns {boolean}
   */
  queueWorker() {
    this._printQueueStatus();
    if (this.activeTasks.length >= this.maxSimultaneousJobs || this.queue.length === 0) {
      return false;
    }

    const element = this.queue.shift();

    const isElementInActiveTasks = this.activeTasks.find(task => task === element.id);

    if (isElementInActiveTasks !== undefined) {
      this.queue.push(element);

      return false;
    }

    this.activeTasks.push(element);
    element.run()
      .then(() => {
        const index = this.activeTasks.findIndex(task => task.id === element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        }
        this._printQueueStatus();
        this.compactReplicationDatabaseIfNecessary();
        this.doWork();
      })
      .catch(error => {
        this.logger.logString(`Failed adding replication: ${error}`);
        const index = this.activeTasks.findIndex(task => task.id === element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        }
        this._printQueueStatus();
        this.doWork();
      });

    return true;
  }

  compactReplicationDatabaseIfNecessary() {
    this.compactReplicationCounter += 1;
    if (this.compactReplicationCounter >= this.compactReplicationDbCycle) {
      compactReplicationDatabase(this.nanoAdmin, this.logger);
      this.compactReplicationCounter = 0;
    }
  }

  /**
   *
   */
  listenToReplicationChanges() {
    const replicatorDb = this.nanoAdmin.use('_replicator');
    const feedReplicator = replicatorDb.follow({ include_docs: true });

    feedReplicator.filter = function (doc) {
      return !doc._deleted;
    };

    feedReplicator.on('change', change => {
      this.activeTasks.forEach(task => {
        task.onChangeOccurred(change);
      });
    });
    feedReplicator.follow();
  }

  _printQueueStatus() {
    if (this.lastQueueStatus.activeTasksLength !== this.activeTasks.length ||
      this.lastQueueStatus.queueLength !== this.queue.length) {
      this.logger.logString(`Active tasks: ${this.activeTasks.length}/${this.maxSimultaneousJobs} | Queue length: ${this.queue.length}`);
    }
    this.lastQueueStatus.activeTasksLength = this.activeTasks.length;
    this.lastQueueStatus.queueLength = this.queue.length;
  }
}

exports.WorkerQueue = WorkerQueue;
