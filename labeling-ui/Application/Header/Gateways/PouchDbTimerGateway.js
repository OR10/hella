/**
 * Gateway for retrieving timer data
 */
class PouchDbTimerGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {RevisionManager} revisionManager
   */
  constructor(pouchDbContextService, packagingExecutor, couchDbModelDeserializer, revisionManager) {
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
  }

  createTimerDocument(projectId, taskId, userId) {
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);
    const timerDocument = {
      type: 'AppBundle.Model.TaskTimer',
      taskId: taskId,
      projectId: projectId,
      userId: userId,
      timeInSeconds: {
        labeling: 0,
      },
    };

    return this._packagingExecutor.execute(queueIdentifier, () => {
      return dbContext.post(timerDocument);
    });
  }

  /**
   * @param projectId
   * @param taskId
   * @param userId
   * @returns {Promise<timerDocument>}
   */
  readOrCreateTimerIfMissingWithIdentification(projectId, taskId, userId) {
    return this.getTime(taskId, userId)
      .then(
        timerDocument => timerDocument,
        () => this.createTimerDocument(projectId, taskId, userId)
      );
  }

  /**
   * Gets the time for the given {@link Task}
   *
   * @param {Task} task
   * @param {User} user
   * @return {AbortablePromise<Object|Error>}
   */
  getTime(task, user) {
    const queueIdentifier = 'timer';
    const viewIdentifier = 'annostation_task_timer/by_taskId_userId';
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(viewIdentifier, {
        include_docs: true,
        key: [task.id, user.id],
      }))
    .then(response => {
      if (response.rows[0] === undefined) {
        // Currently no time logged for this task.
        // Return empty default value.
        return {time: 0};
      }

      const timerDocument = response.rows[0].doc;
      this._couchDbModelDeserializer.deserializeTimer(timerDocument, task.getPhase())
    })
  }


  /**
   * Starts export for the given {@link Task} and export type
   *
   * @param {string} taskId
   * @param {string} userId
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(taskId, userId, time) {
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this.getTime(taskId, userId)
    .then(dbDocument => {
      dbDocument.timeInSeconds.labeling = time;
      return this._packagingExecutor.execute(queueIdentifier, () => {
        this._injectRevisionOrFailSilently(dbDocument);
        return dbContext.put(dbDocument);
      });
    });
  }

  /**
   * Inject a revision into the document or fail silently and ignore the error.
   *
   * @param {object} document
   * @private
   */
  _injectRevisionOrFailSilently(document) {
    try {
      this._revisionManager.injectRevision(document);
    } catch (error) {
      // Simply ignore
    }
  }
}

PouchDbTimerGateway.$inject = [
  'pouchDbContextService',
  'packagingExecutor',
  'couchDbModelDeserializer',
  'revisionManager',
];

export default PouchDbTimerGateway;
