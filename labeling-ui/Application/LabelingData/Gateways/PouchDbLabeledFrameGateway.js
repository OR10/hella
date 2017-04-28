import LabeledFrame from '../Models/LabeledFrame';

/**
 * Gateway for saving and retrieving {@link LabeledFrame}s from pouchdb
 */
class PouchDbLabeledFrameGateway {
  /**
   * @param {$q} $q
   * @param {PackagingExecutor} packagingExecutor
   * @param {PouchDbContextService} pouchDbContextService
   * @param {CouchDbModelDeserializer} couchDbModelDeserializer
   * @param {CouchDbModelSerializer} couchDbModelSerializer
   * @param {PouchDbViewService} pouchDbViewService
   * @param {RevisionManager} revisionManager
   * @param {EntityIdService} entityIdService
   */
  constructor($q, packagingExecutor, pouchDbContextService, couchDbModelDeserializer, couchDbModelSerializer, pouchDbViewService, revisionManager, entityIdService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {PackagingExecutor}
     * @private
     */
    this._packagingExecutor = packagingExecutor;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {CouchDbModelDeserializer}
     * @private
     */
    this._couchDbModelDeserializer = couchDbModelDeserializer;

    /**
     * @type {CouchDbModelSerializer}
     * @private
     */
    this._couchDbModelSerializer = couchDbModelSerializer;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;

    /**
     * @type {RevisionManager}
     * @private
     */
    this._revisionManager = revisionManager;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;
  }

  /**
   * Returns the {@link LabeledFrame} for the given `taskId` and `frameIndex`
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  getLabeledFrame(taskId, frameIndex) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const db = this._pouchDbContextService.provideContextForTaskId(taskId);
      const viewIdentifier = this._pouchDbViewService.getDesignDocumentViewName(
        'labeledFrameByTaskIdAndFrameIndex'
      );
      return this._$q.resolve()
        .then(() => db.query(viewIdentifier, {
          key: [taskId, frameIndex],
          include_docs: true,
          limit: 1
        }))
        .then(result => {
          const labeledFrameDocument = result.rows[0].doc;
          this._revisionManager.extractRevision(labeledFrameDocument);
          const labeledFrame = this._couchDbModelDeserializer.deserializeLabeledFrame(labeledFrameDocument);
          return labeledFrame;
        })
    });
  }


  /**
   * Updates the labeled frame for the given task and frame number in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   * @param {LabeledFrame} labeledFrame
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  saveLabeledFrame(taskId, frameIndex, labeledFrame) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const db = this._pouchDbContextService.provideContextForTaskId(taskId);
      return this._$q.resolve()
        .then(() => {
          const labeledFrameDocument = this._couchDbModelSerializer.serialize(labeledFrame);
          labeledFrameDocument.frameIndex = frameIndex;
          this._injectRevisionOrFailSilently(labeledFrameDocument);
          if (labeledFrameDocument._id === undefined || labeledFrameDocument._id === null) {
            // The backend currently explicitly creates those ids if not present
            // @TODO: Check why this is necessary, if it is. In may opinion the Frontend Models should already
            //        have an id.
            labeledFrameDocument._id = this._entityIdService.getUniqueId();
          }

          return db.put(labeledFrameDocument);
        })
        .then(result => {
          this._revisionManager.extractRevision(result);
          return db.get(result.id)
        })
        .then(
          document => this._couchDbModelDeserializer.deserializeLabeledFrame(document)
        );
    });
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {String} taskId
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<Boolean|Error>}
   */
  deleteLabeledFrame(taskId, frameIndex) {

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

PouchDbLabeledFrameGateway.$inject = [
  '$q',
  'packagingExecutor',
  'pouchDbContextService',
  'couchDbModelDeserializer',
  'couchDbModelSerializer',
  'pouchDbViewService',
  'revisionManager',
  'entityIdService',
];

export default PouchDbLabeledFrameGateway;
