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
   */
  constructor(pouchDbContextService, packagingExecutor, couchDbModelDeserializer, revisionManager, pouchDbViewService) {
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
   * @param {Project} project
   * @param {Task} task
   * @param {User} user
   * @returns {AbortablePromise<Object>}
   */
  readOrCreateTimerIfMissingWithIdentification(project, task, user) {
    return this.getTime(task, user)
      .then(
        timerDocument => timerDocument,
        () => this.createTimerDocument(project, task, user)
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
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(this._pouchDbViewService.get('taskTimerByTaskIdAndUserId'), {
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
      return this._couchDbModelDeserializer.deserializeTimer(timerDocument, task.getPhase());
    });
  }


  /**
   * Starts export for the given {@link Task} and export type
   *
   * @param {Task} task
   * @param {User} user
   * @param {int} time
   * @returns {AbortablePromise<string|Error>}
   */
  updateTime(task, user, time) {
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this.getTime(task, user)
    .then(dbDocument => {
      dbDocument.time = time;
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
  'pouchDbViewService',
];

export default PouchDbTimerGateway;
