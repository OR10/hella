import LabeledThingInFrame from '../Models/LabeledThingInFrame';

/**
 * Gateway for CRUD operation on {@link LabeledThing}s in a PouchDb
 */
class PouchDbLabeledThingInFrameGateway {
  /**
   * @param {StorageContextService} storageContextService
   * @param {RevisionManager} revisionManager
   * @param {PackagingExecutor} packagingExecutor
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {PouchDbLabeledThingGateway} pouchLabeledThingGateway
   */
  constructor(storageContextService, revisionManager, packagingExecutor, couchDbModelSerializer, couchDbModelDeserializer, pouchLabeledThingGateway) {
    /**
     * @type {StorageContextService}
     * @private
     */
    this._storageContextService = storageContextService;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {PackagingExecutor}
     * @private
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {CouchDbModelSerializer}
     * @private
     */
    this._couchDbModelSerializer = couchDbModelSerializer;

    /**
     * @type {CouchDbModelDeserializer}
     * @private
     */
    this._couchDbModelDeserializer = couchDbModelDeserializer;

    /**
     * @type {PouchDbLabeledThingGateway}
     * @private
     */
    this._pouchLabeledThingGateway = pouchLabeledThingGateway;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameIndex`
   *
   * @param {Task} task
   * @param {Number} frameIndex
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameIndex, offset = 0, limit = 1) {
    const startkey = frameIndex + offset;
    const endkey = frameIndex + offset + limit - 1;

    const db = this._storageContextService.provideContextForTaskId(task.id);

    this._packagingExecutor.execute('labeledThingInFrame', () => {
      db.query('annostation_labeled_thing_in_frame/by_taskId_frameIndex', {
        startkey,
        endkey,
        include_docs: true,
      }).then(result => {
        if (result.rows) {
          const docs = [];
          result.rows.forEach(row => {
            if (row.doc) {
              const labeledThingInFrame = row.doc;
              const labeledThing = this._pouchLabeledThingGateway.getLabeledThing(labeledThingInFrame);

              docs.push(this._couchDbModelDeserializer.deserializeLabeledThingInFrame(labeledThingInFrame, labeledThing));
            }

            throw new Error('Row does not contain a document');
          });

          return docs;
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
    });
  }


  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameIndex`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameIndex`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameIndex, labeledThing, offset = 0, limit = 1) {
    const startkey = [labeledThing.id, frameIndex + offset];
    const endkey = [labeledThing.id, frameIndex + offset + limit - 1];

    const db = this._storageContextService.provideContextForTaskId(task.id);

    this._packagingExecutor.execute('labeledThingInFrame', () => {
      db.query('annostation_labeled_thing_in_frame/by_labeledThingId_frameIndex', {
        startkey,
        endkey,
        include_docs: true,
      }).then(result => {
        if (result.rows) {
          const docs = [];
          result.rows.forEach(row => {
            if (row.doc) {
              const labeledThingInFrame = row.doc;

              docs.push(this._couchDbModelDeserializer.deserializeLabeledThingInFrame(labeledThingInFrame, labeledThing));
            }

            throw new Error('Row does not contain a document');
          });

          return docs;
        }

        throw new Error(`Failed loading labeled thing in frame for the given labeledThing: ${labeledThing.id}`);
      });
    });
  }

  /**
   * Returns the next incomplete labeled things in frame.
   * The count can be specified, the default is one.
   *
   * @param {Task} task
   * @param {int?} count
   *
   * @returns {AbortablePromise<Array.<LabeledThingInFrame>>|Error}
   */
  getNextIncomplete(task, count = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame`,
      {
        incompleteOnly: true,
        limit: count,
      }
    );

    return this.bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading incomplete labeled thing in frame');
      });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    if (labeledThingInFrame.ghost === true) {
      throw new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!');
    }

    const db = this._storageContextService.provideContextForTaskId(labeledThingInFrame.task.id);
    const document = this._couchDbModelSerializer.serialize(labeledThingInFrame);
    this._injectRevisionOrFailSilently(document);
    //@TODO: What about error handling here? No global handling is possible this easily?
    //       Monkey-patch pouchdb? Fix error handling at usage point?
    return this._packagingExecutor.execute(
      'labeledThing',
      () => db.put(document)
    ).then(response => {
      this._revisionManager.extractRevision(response);

      return new LabeledThingInFrame(Object.assign({}, labeledThingInFrame.toJSON(), {task: labeledThingInFrame.labeledThing.task}));
    });
  }
}

PouchDbLabeledThingInFrameGateway.$inject = [
  'storageContextService',
  'revisionManager',
  'packagingExecutor',
  'couchDbModelSerializer',
  'couchDbModelDeserializer',
  'pouchLabeledThingGateway',
];

export default PouchDbLabeledThingInFrameGateway;
