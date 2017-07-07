const {Utils} = require('./Utils');

class Worker {
  constructor(nanoAdmin) {
    this.maxSimultaneousJobs = 50;
    this.compactReplicationDbCycle = 500;
    this.compactReplicationCounter = 0;
    this.queue = [];
    this.activeTasks = [];
    this.nanoAdmin = nanoAdmin;

    this.listenToReplicationChanges();
  }

  /**
   *
   * @param job
   */
  addJob(job) {
    this.queue.push(job);
    this.queue = this.removeDuplicates(this.queue, 'id');

    this.doWork();
  }

  /**
   *
   * @param arr
   * @param prop
   * @returns {Array}
   */
  removeDuplicates(arr, prop) {
    const newArray = [];
    const lookup = {};

    for (var i in arr) {
      lookup[arr[i][prop]] = arr[i];
    }

    for (i in lookup) {
      newArray.push(lookup[i]);
    }

    return newArray;
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

    const isElementInActiveTasks = this.activeTasks.find((task) => {
      return task === element.id;
    });


    if (isElementInActiveTasks !== undefined) {
      this.queue.push(element);

      return false;
    }

    this.activeTasks.push(element.id);
    element.run()
      .catch(error => {
        console.log(`Failed adding replication: ${error}`);
        const index = this.activeTasks.indexOf(element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        }
      });

    this.doWork();
    this.compactReplicationDatabase();
    this._printQueueStatus();
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
    const feedReplicator = replicatorDb.follow({include_docs: true});

    feedReplicator.filter = function(doc) {
      return !doc._deleted;
    };

    feedReplicator.on('change', change => {
      if (change.doc._replication_state === 'completed') {
        Utils.destroyAndPurgeDocument(this.nanoAdmin, replicatorDb, change.doc._id, change.doc._rev, () => {
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
    console.log('Active tasks: ' + this.activeTasks.length + '/' + this.maxSimultaneousJobs + ' | Queue length: ' + this.queue.length);
  }
}

exports.Worker = Worker;
