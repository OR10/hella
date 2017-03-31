/**
 * Gateway for retrieving timer data
 */
class PouchDbTimerGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   * @param {PouchDbViewService} pouchDbViewService
   * @param {angular.$q} $q
   */
  constructor(pouchDbContextService, packagingExecutor, couchDbModelDeserializer, revisionManager, pouchDbViewService, $q) {
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
     * @type {CouchDbModelDeserializer}
     * @private
     */
    this._couchDbModelDeserializer = couchDbModelDeserializer;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

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
    };

    return this._packagingExecutor.execute(queueIdentifier, () => {
      return dbContext.post(timerDocument);
    });
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
    return this.getTimerDocument(task, user)
      .then(
        timerDocument => timerDocument,
        () => this.createTimerDocument(project, task, user)
      )
      .then(timerDocument => {
        // Make sure the Revision Manager knows the document
        this._revisionManager.extractRevision(timerDocument);
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
    return this.getTimerDocument(task, user)
    .then(timerDocument => {
      return this._couchDbModelDeserializer.deserializeTimer(timerDocument, task.getPhase());
    });
  }

  /**
   * Get the stored Timer Document for the given task and user
   *
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise<Object|Error>}
   */
  getTimerDocument(task, user) {
    const queueIdentifier = 'timer';
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(this._pouchDbViewService.get('taskTimerByTaskIdAndUserId'), {
        include_docs: true,
        key: [task.id, user.id],
      }))
      .then(response => {
        return this._$q((resolve, reject) => {
          if (response.rows.length > 0) {
            resolve(response.rows[0].doc);
          } else {
            reject(new Error(`No Timer Document found for Task ID ${task.id}`))
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

    return this.getTimerDocument(task, user)
      .then(timerDocument => {
        const phase = task.getPhase();
        timerDocument.timeInSeconds[phase] = time;

        return this._packagingExecutor.execute(queueIdentifier, () => {
          this._revisionManager.injectRevision(timerDocument);
          return dbContext.put(timerDocument);
        })
      })
      .then(response => {
        this._revisionManager.extractRevision(response);
      })
  }
}

PouchDbTimerGateway.$inject = [
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelDeserializer',
  'revisionManager',
  'pouchDbViewService',
  '$q'
];

export default PouchDbTimerGateway;
