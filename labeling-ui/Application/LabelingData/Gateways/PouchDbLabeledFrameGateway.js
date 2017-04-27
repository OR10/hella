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
   * @param {PouchDbViewService} pouchDbViewService
   */
  constructor($q, packagingExecutor, pouchDbContextService, couchDbModelDeserializer, pouchDbViewService) {
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
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;
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
}

PouchDbLabeledFrameGateway.$inject = [
  '$q',
  'packagingExecutor',
  'pouchDbContextService',
  'couchDbModelDeserializer',
  'pouchDbViewService',
];

export default PouchDbLabeledFrameGateway;
