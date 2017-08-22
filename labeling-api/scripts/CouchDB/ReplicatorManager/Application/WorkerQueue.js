const { compactReplicationDatabase } = require('./Utils');

class WorkerQueue {
  /**
   * @param nanoAdmin
   * @param logger
   * @param {CompactionService} compactionService
   * @param maxSimultaneousJobs
   * @param compactReplicationDbCycle
   */
  constructor(nanoAdmin, logger, compactionService, maxSimultaneousJobs = 50, compactReplicationDbCycle = 500) {
    this.nanoAdmin = nanoAdmin;
    this.logger = logger;

    /**
     * @type {CompactionService}
     * @private
     */
    this._compactionService = compactionService;

    this.maxSimultaneousJobs = maxSimultaneousJobs;
    this._compactReplicationDbCycle = compactReplicationDbCycle;
    this._compactReplicationCounter = 0;

    /**
     * Flag set if a compaction should be triggered. This indicates, that no more jobs are added to the activequeue
     * for the time being, until the replication has been triggered and executed.
     *
     * @type {boolean}
     * @private
     */
    this._compactionRequested = false;

    this.queue = [];
    this.activeTasks = [];
    this.lastQueueStatus = {};
  }

  /**
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
   * Remove a queued entry by its id
   *
   * The id can be calculated using the {@link getReplicationDocumentIdName} function
   *
   * The return value indicates if the item to remove was found or not.
   *
   * @param {string} id
   * @returns {boolean}
   */
  removeJob(id) {
    const jobIndexToRemove = this.queue.findIndex(candidate => candidate.id === id);
    if (jobIndexToRemove === -1) {
      return false;
    }

    this.queue.splice(jobIndexToRemove, 1);
    return true;
  }

  doWork() {
    setImmediate(() => {
      this._printQueueStatus();
      this.queueWorker();
    });
  }

  /**
   * @returns {boolean}
   */
  queueWorker() {
    // Never do work, while compaction is in progress
    if (this._compactionService.isCompactionInProgress()) {
      return;
    }

    if (this._compactionRequested === true) {
      if (this.activeTasks.length > 0) {
        // Do not add further active tasks while waiting for compaction to be run.
        return;
      } else {
        // Trigger compaction once the active tasks queue is empty
        this.logger.logString('Compacting _replicator database...');
        this._compactionService.compactDb()
          .then(() => {
            this.logger.logString('Compaction of _replicator database completed.');
            this._compactionRequested = false;
            this._resetReplicationCounter();
            // Restart working after compaction is finished.
            this.doWork();
          })
          .catch(error => {
            this.logger.logString(`Compaction failed: ${error}. Resuming normal operations...`);
            this._compactionRequested = false;
            this._resetReplicationCounter();
            // Restart working after compaction is finished.
            this.doWork();
          });
        // Wait for compaction to finish, before doing anything else
        return;
      }
    }

    if (this.activeTasks.length >= this.maxSimultaneousJobs || this.queue.length === 0) {
      return false;
    }

    const element = this.queue.shift();

    const isElementInActiveTasks = this.activeTasks.findIndex(task => task.id === element.id) !== -1;

    if (isElementInActiveTasks) {
      this.queue.push(element);
      this.logger.logString(`Ignore element ${element.id} because its already in active queue`);

      return false;
    }

    this.activeTasks.push(element);
    this.logger.logString(`Added ${element.id} to active tasks`);
    element.run()
      .then(() => {
        const index = this.activeTasks.findIndex(task => task.id === element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        } else {
          this.logger.logString(`FAILED to removed task "${element.id}" from active tasks queue`);
        }

        this._compactionRequested = this._isDatabaseReplicationNecessary();
        this._incrementReplicationCounter();

        this.doWork();
      })
      .catch(error => {
        this.logger.logString(error);
        const index = this.activeTasks.findIndex(task => task.id === element.id);
        if (index !== -1) {
          this.activeTasks.splice(index, 1);
        } else {
          this.logger.logString(`FAILED to removed task "${element.id}" from active tasks queue`);
        }

        if (element.hasReachedMaximumRetries()) {
          this.logger.logString(`Replication failed (Maximum retries reached ${element.retryCount}. Not Queueing again): ${error}`);
        } else {
          element.incrementRetryCount();
          this.logger.logString(`Replication failed (Requeued. Tried already ${element.retryCount} times): ${error}`);
          this.addJob(element);
        }
        
        this.doWork();
      });

    // Enqueue items until the active queue is full.
    this.queueWorker();
    return true;
  }

  _isDatabaseReplicationNecessary() {
    return (this._compactReplicationCounter >= this._compactReplicationDbCycle);
  }

  _incrementReplicationCounter() {
    this._compactReplicationCounter++;
  }

  _resetReplicationCounter() {
    this._compactReplicationCounter = 0;
  }

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
    feedReplicator.on('error', er => {
      this.logger.logString('_listenToReplicationChanges');
      throw er;
    });
    feedReplicator.follow();
  }

  _printQueueStatus() {
    if (this.lastQueueStatus.activeTasksLength !== this.activeTasks.length ||
      this.lastQueueStatus.queueLength !== this.queue.length) {
      this.logger.logString(`Active tasks: ${this.activeTasks.length}/${this.maxSimultaneousJobs} | Queue length: ${this.queue.length} | Compaction Req./inProgress: ${this._isDatabaseReplicationNecessary()}/${this._compactionService.isCompactionInProgress()}`);
    }
    this.lastQueueStatus.activeTasksLength = this.activeTasks.length;
    this.lastQueueStatus.queueLength = this.queue.length;
  }
}

exports.WorkerQueue = WorkerQueue;
