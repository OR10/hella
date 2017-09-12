import moment from 'moment';
/**
 * Gateway for retrieving timer data
 */
class TimerGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {PouchDbViewService} pouchDbViewService
   * @param {angular.$q} $q
   */
  constructor(pouchDbContextService, packagingExecutor, pouchDbViewService, $q) {
    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {PackagingExecutor}
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;
  }

  /**
   * @param {Project} project
   * @param {Task} task
   * @param {User} user
   * @return {Promise}
   */
  createTimerDocument(project, task, user) {
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    const timerDocument = {
      type: 'AppBundle.Model.TaskTimer',
      taskId: task.id,
      projectId: project.id,
      userId: user.id,
      timeInSeconds: {
        labeling: 0,
      },
      createdAt: this._getCurrentDate(),
      lastModifiedAt: this._getCurrentDate(),
    };

    return this._packagingExecutor.execute(queueIdentifier, () => {
      return dbContext.post(timerDocument);
    });
  }

  /**
   * @protected
   * @returns {string}
   */
  _getCurrentDate() {
    return moment().format('YYYY-MM-DD HH:mm:ss.000000');
  }

  /**
   * Gets the stored Timer Document for the given project, task and user
   * If no Timer Document exists, a new one is created
   *
   * @param {Project} project
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise<Object>}
   */
  readOrCreateTimerIfMissingWithIdentification(project, task, user) {
    return this._getTimerDocument(task, user)
      .then(
        timerDocument => timerDocument,
        () => this.createTimerDocument(project, task, user)
      )
      .then(timerDocument => {
        return timerDocument;
      });
  }

  /**
   * Gets the time for the phase of the given {@link Task}
   *
   * @param {Task} task
   * @param {User} user
   * @return {AbortablePromise<Object|Error>}
   */
  getTime(task, user) {
    return this._getTimerDocument(task, user)
    .then(timerDocument => {
      const timerModel = {time: 0};
      const phase = task.getPhase();

      if (timerDocument.timeInSeconds === undefined) {
        throw new Error('Invalid timer document.');
      }

      if (timerDocument.timeInSeconds[phase] !== undefined) {
        timerModel.time = timerDocument.timeInSeconds[phase];
      }

      return timerModel;
    });
  }

  /**
   * Get the stored Timer Document for the given task and user
   *
   * @private
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise<Object|Error>}
   */
  _getTimerDocument(task, user) {
    const queueIdentifier = 'timer';
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(this._pouchDbViewService.getDesignDocumentViewName('taskTimerByTaskIdAndUserId'), {
        include_docs: true,
        key: [task.id, user.id],
      }))
      .then(response => {
        return this._$q((resolve, reject) => {
          if (response.rows.length > 0) {
            resolve(response.rows[0].doc);
          } else {
            reject(new Error(`No Timer Document found for Task ID ${task.id}`));
          }
        });
      });
  }


  /**
   * Update Time for the current Task and User with the given time
   *
   * @param {Task} task
   * @param {User} user
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(task, user, time) {
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._getTimerDocument(task, user)
      .then(timerDocument => {
        const phase = task.getPhase();
        timerDocument.timeInSeconds[phase] = time;
        timerDocument.lastModifiedAt = this._getCurrentDate();
        if (timerDocument.createdAt === undefined) {
          timerDocument.createdAt = this._getCurrentDate();
        }

        return this._packagingExecutor.execute(queueIdentifier, () => {
          return dbContext.put(timerDocument);
        });
      });
  }
}

TimerGateway.$inject = [
  'pouchDbContextService',
  'packagingExecutor',
  'pouchDbViewService',
  '$q',
];

export default TimerGateway;
