class CompactionService {
  /**
   * @param {nano} nanoDb
   */
  constructor(nanoDb) {
    /**
     * @type {nano}
     * @private
     */
    this._db = nanoDb;

    /**
     * @type {boolean}
     * @private
     */
    this._compactionInProgress = false;
  }

  /**
   * @returns {Promise}
   */
  compactDb() {
    const compactionPromise = Promise.resolve()
      .then(() => {
        this._compactionInProgress = true;
      })
      .then(() => this._startCompaction())
      .then(() => this._waitForCompactionToFinish());

    compactionPromise
      .then(() => {
        this._compactionInProgress = false;
      })
      .catch(error => {
        this._compactionInProgress = false;
      });

    return compactionPromise;
  }

  /**
   * @returns {boolean}
   */
  isCompactionInProgress() {
    return this._compactionInProgress;
  }

  /**
   * @returns {Promise}
   * @private
   */
  _startCompaction() {
    return new Promise((resolve, reject) => {
      this._db.compact(error => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Poll the database using the given delay for finishing the compaction
   *
   * Unfortunately there is no way of doing this by push
   *
   * @param {number?} delay
   * @returns {Promise}
   * @private
   */
  _waitForCompactionToFinish(delay = 1000) {
    return new Promise((resolve, reject) => {
      const doCheck = () => {
        return this._checkCompactionAndSleepCycle(delay)
          .then(finished => {
            if (finished === true) {
              resolve();
            } else {
              return doCheck();
            }
          })
          .catch(error => reject(error));
      };

      doCheck();
    });
  }

  /**
   * @param {number} delay
   * @returns {Promise.<boolean>}
   * @private
   */
  _checkCompactionAndSleepCycle(delay) {
    return Promise.resolve()
      .then(() => this._hasCompactionFinished())
      .then(finished => {
        if (finished === true) {
          return finished;
        }
        return this._sleep(delay).then(() => false);
      });
  }

  /**
   * @returns {Promise.<boolean>}
   * @private
   */
  _hasCompactionFinished() {
    return new Promise((resolve, reject) => {
      this._db.info((error, body) => {
        if (error) {
          reject(error);
        } else {
          resolve(!(body.compact_running === true));
        }
      });
    });
  }

  /**
   * @param {number} delay
   * @returns {Promise}
   * @private
   */
  _sleep(delay) {
    return new Promise(resolve => {
      setTimeout(() => resolve(), delay);
    });
  }
}

exports.CompactionService = CompactionService;
