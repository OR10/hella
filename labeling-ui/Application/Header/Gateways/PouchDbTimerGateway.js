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
        console.log('getTimerDocument');
        console.log(response);
        console.log(response.rows[0].doc);
        return response.rows[0].doc;
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
    console.log('updateTime');
    const queueIdentifier = 'timer';
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return this.getTimerDocument(task, user)
      .then(timerDocument => {
        const phase = task.getPhase();
        timerDocument.timeInSeconds[phase] = time;

        console.log('before');
        console.log(timerDocument);
        return this._packagingExecutor.execute(queueIdentifier, () => {
          this._injectRevisionOrFailSilently(timerDocument);
          return dbContext.put(timerDocument);
        })
      })
      .then(() => {
        return this.getTimerDocument(task, user);
      })
      .then(timerDocument => {
        console.log('after');
        console.log(timerDocument);
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
