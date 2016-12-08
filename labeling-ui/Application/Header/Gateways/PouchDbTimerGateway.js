/**
 * Gateway for retrieving timer data
 */
class PouchDbTimerGateway {
  /**
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PackagingExecutor} packagingExecutor
   * @param {RevisionManager} revisionManager
   */
  constructor(pouchDbContextService, packagingExecutor, revisionManager) {
    /**
     * @type {PouchDBContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {PackagingExecutorService}
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;
  }

  /**
   * Gets the time for the given {@link Task}
   *
   * @param {string} taskId
   * @param {string} userId
   * @return {AbortablePromise<int|Error>}
   */
  getTime(taskId, userId) {
    const queueIdentifier = 'timer';
    const viewIdentifier = 'annostation_task_timer/by_taskId_userId';
    const db = this._pouchDbContextService.provideContextForTaskId(taskId);

    return this._packagingExecutor.execute(
      queueIdentifier,
      () => db.query(viewIdentifier, {
        include_docs: true,
        key: [taskId, userId],
      }))
    .then(response => {
        // @TODO wrap in clientside TimerModel?
        return response.rows[0].doc;
    })
    .then(timeDocument => {
      if (typeof timeDocument !== 'object') {
        throw new Error('Failed loading time');
      }

      return timeDocument;
    });
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
  'revisionManager',
];

export default PouchDbTimerGateway;
