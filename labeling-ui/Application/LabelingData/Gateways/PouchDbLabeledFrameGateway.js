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
   * Returns the {@link LabeledFrame} for the given `task` and `frameIndex`
   *
   * @param {String} task
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  getLabeledFrame(task, frameIndex) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const db = this._pouchDbContextService.provideContextForTaskId(task.id);
      return this._$q.resolve()
        .then(() => this._getCurrentOrPreceedingLabeledFrame(db, task, frameIndex))
        .then(labeledFrame => {
          if (labeledFrame === null) {
            return new LabeledFrame({
              frameIndex,
              id: this._entityIdService.getUniqueId(),
              incomplete: true,
              task: task,
              classes: [],
            });
          }

          return labeledFrame;
        });
    });
  }

  /**
   * @param {PouchDB} db
   * @param {Task} task
   * @param {number} frameIndex
   * @return {Promise.<Object|null>}
   * @private
   */
  _getCurrentOrPreceedingLabeledFrame(db, task, frameIndex) {
    const viewIdentifier = this._pouchDbViewService.getDesignDocumentViewName(
      'labeledFrameByTaskIdAndFrameIndex'
    );
    return this._$q.resolve()
      .then(() => db.query(viewIdentifier, {
        startkey: [task.id, frameIndex],
        endkey: [task.id, 0],
        include_docs: true,
        descending: true,
        limit: 1,
      })).then(result => {
        if (result.rows.length === 0) {
          return null;
        }
        const labeledFrameDocument = result.rows[0].doc;

        if (labeledFrameDocument.frameIndex === frameIndex) {
          this._revisionManager.extractRevision(labeledFrameDocument);
        } else {
          labeledFrameDocument.frameIndex = frameIndex;
          labeledFrameDocument._id = this._entityIdService.getUniqueId();
          delete labeledFrameDocument._rev;
        }

        const labeledFrame = this._couchDbModelDeserializer.deserializeLabeledFrame(labeledFrameDocument, task);
        return labeledFrame;
      });
  }


  /**
   * Updates the labeled frame for the given task and frame number in the database
   *
   * @param {Task} task
   * @param {Integer} frameIndex
   * @param {LabeledFrame} labeledFrame
   *
   * @returns {AbortablePromise<LabeledFrame|Error>}
   */
  saveLabeledFrame(task, frameIndex, labeledFrame) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const db = this._pouchDbContextService.provideContextForTaskId(task.id);
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
          return db.get(result.id);
        })
        .then(
          document => {
            const foo = this._couchDbModelDeserializer.deserializeLabeledFrame(document, task);
            return foo;
          }
        );
    });
  }

  /**
   * Returns the nex incomplete labeled frame.
   * The count can be specified, the default is one.
   *
   * @param {Task} task
   * @param {int?} count
   *
   * @return {AbortablePromise<Array<LabeledFrame>>|Error}
   */
  getNextIncomplete(task, count = 1) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const startkey = [task.id, true];
      const endkey = [task.id, true];
      const db = this._pouchDbContextService.provideContextForTaskId(task.id);

      return this._$q.resolve()
        .then(() => {
          const incompletePromise = db.query(
            this._pouchDbViewService.getDesignDocumentViewName('labeledFrameIncomplete'),
            {
              startkey,
              endkey,
              include_docs: true,
            });
          const firstLabeledFramePromise = this._getCurrentOrPreceedingLabeledFrame(db, task, 0);

          return this._$q.all([incompletePromise, firstLabeledFramePromise]);
        })
        .then(([icompleteLabeledFrameResult, firstLabeledFrameOrNull]) => {
          const incompleteLabeledFrames = icompleteLabeledFrameResult.rows.map(
            row => this._couchDbModelDeserializer.deserializeLabeledFrame(row.doc, task)
          );
          // Get all incompletes without the first frame since it is added manually later if needed
          let incompletes = incompleteLabeledFrames.filter(labeledFrame => labeledFrame.frameIndex !== 0);

          if (firstLabeledFrameOrNull === null) {
            const firstLabeledFrame = new LabeledFrame({
              id: this._entityIdService.getUniqueId(),
              classes: [],
              incomplete: true,
              task,
              frameIndex: 0,
              ghostClasses: null,
            });

            // If the first frame is not set, create a object and add it to the beginning of the array
            incompletes = [firstLabeledFrame].concat(incompletes);
          }

          return incompletes.slice(0, count);
        });
    });
  }

  /**
   * @param {Task} task
   * @return {AbortablePromise.<{count: int}|Error>}
   */
  getIncompleteLabeledFrameCount(task) {
    const db = this._pouchDbContextService.provideContextForTaskId(task.id);
    return this._packagingExecutor.execute('labeledFrame',
      () => {
        const incompletePromise = db.query(this._pouchDbViewService.getDesignDocumentViewName('labeledFrameIncomplete'), {
          include_docs: false,
          key: [task.id, true],
        });
        const firstFramePromise = this._getCurrentOrPreceedingLabeledFrame(db, task, 0);

        return this._$q.all([incompletePromise, firstFramePromise]);
      })
      .then(([incomplete, firstFrame]) => {
        let count = incomplete.rows.length;

        if (firstFrame === null) {
          count++;
        }

        return {count};
      });
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {Task} task
   * @param {Integer} frameIndex
   *
   * @returns {AbortablePromise<Boolean|Error>}
   */
  deleteLabeledFrame(task, frameIndex) {
    return this._packagingExecutor.execute('labeledFrame', () => {
      const db = this._pouchDbContextService.provideContextForTaskId(task.id);
      return this._$q.resolve()
        .then(() => {
          const viewDesignDocument = this._pouchDbViewService.getDesignDocumentViewName('labeledFrameByTaskIdAndFrameIndex');
          return db.query(viewDesignDocument, {
            key: [task.id, frameIndex],
            include_docs: true,
            limit: 1,
          });
        })
        .then(result => {
          if (result.rows.length === 0) {
            // No document there. We are finished.
            return {ok: true};
          }
          const labeledFrameDocument = result.rows[0].doc;
          const {_id: id, _rev: revision} = labeledFrameDocument;
          return db.remove(id, revision);
        })
        .then(result => {
          return result.ok;
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
