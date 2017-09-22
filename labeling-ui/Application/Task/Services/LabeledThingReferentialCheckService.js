class LabeledThingReferentialCheckService {
  /**
   * @param $q
   * @param {PouchDbContextService} pouchDbContextService
   * @param {PouchDbViewService} pouchDbViewService
   */
  constructor($q, pouchDbContextService, pouchDbViewService) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {PouchDbContextService}
     * @private
     */
    this._pouchDbContextService = pouchDbContextService;

    /**
     * @type {PouchDbViewService}
     * @private
     */
    this._pouchDbViewService = pouchDbViewService;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param newStartFrameIndex
   * @param newEndFrameIndex
   */
  isAtLeastOneLabeledThingInFrameInRange(task, labeledThing, newStartFrameIndex, newEndFrameIndex) {
    return this._$q.resolve()
      .then(() => {
        return this.getAssociatedLabeledThingsInFrames(task, labeledThing);
      }).then(documents => {
        return documents.rows.filter(document => {
          return (document.doc.frameIndex >= newStartFrameIndex && document.doc.frameIndex <= newEndFrameIndex);
        });
      }).then(documentOutsideRange => {
        return documentOutsideRange.length !== 0;
      });
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   */
  getAssociatedLabeledThingsInFrames(task, labeledThing) {
    const dbContext = this._pouchDbContextService.provideContextForTaskId(task.id);

    return dbContext.query(this._pouchDbViewService.getDesignDocumentViewName('labeledThingInFrameByLabeledThingIdAndFrameIndex'), {
      include_docs: true,
      startkey: [labeledThing.id, 0],
      endkey: [labeledThing.id, {}],
    });
  }
}

LabeledThingReferentialCheckService.$inject = [
  '$q',
  'pouchDbContextService',
  'pouchDbViewService',
];

export default LabeledThingReferentialCheckService;
