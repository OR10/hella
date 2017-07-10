const { Utils } = require('./Utils');

class WorkerQueue {
  constructor(nanoAdmin, maxSimultaneousJobs = 50, compactReplicationDbCycle = 500) {
    this.maxSimultaneousJobs = maxSimultaneousJobs;
    this.compactReplicationDbCycle = compactReplicationDbCycle;
    this.compactReplicationCounter = 0;
    this.queue = [];
    this.activeTasks = [];
    this.nanoAdmin = nanoAdmin;
  }

  /**
   *
   * @param job
   */
  addJob(job) {
    this.queue.push(job);
    this.queue = WorkerQueue._removeDuplicatesBy(x => x.id, this.queue);

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
    if (this.activeTasks.length >= this.maxSimultaneousJobs || this.queue.length === 0) {
      this._printQueueStatus();

      return false;
    }

    const element = this.queue.shift();

    const isElementInActiveTasks = this.activeTasks.find(task => task === element.id);


    if (isElementInActiveTasks !== undefined) {
      this.queue.push(element);

      return false;
    }

    this.activeTasks.push(element.id);
    element.run()
      .catch(error => {
        // eslint-disable-next-line no-console
        console.log(`Failed adding replication: ${error}`);
        const index = this.activeTasks.indexOf(element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        }
        this._printQueueStatus();
        this.doWork();
      });

    this.doWork();
    this.compactReplicationDatabase();
    this._printQueueStatus();

    return true;
  }

  compactReplicationDatabase() {
    this.compactReplicationCounter += 1;
    if (this.compactReplicationCounter >= this.compactReplicationDbCycle) {
      Utils.compactReplicationDatabase(this.nanoAdmin);
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
      if (change.doc._replication_state === 'completed') {
        Utils.destroyAndPurgeDocument(
          this.nanoAdmin,
          replicatorDb,
          change.doc._id,
          change.doc._rev,
        ).then(() => {
          const index = this.activeTasks.indexOf(change.doc._id);
          if (index !== -1) {
            this.activeTasks.splice(index, 1);
          }
          this._printQueueStatus();
          this.doWork();
        });
      }
    });
    feedReplicator.follow();
  }

  _printQueueStatus() {
    // eslint-disable-next-line no-console
    console.log(`Active tasks: ${this.activeTasks.length}/${this.maxSimultaneousJobs} | Queue length: ${this.queue.length}`);
  }
}

exports.WorkerQueue = WorkerQueue;
