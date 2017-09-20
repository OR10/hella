class LabeledThingReferentialCheckService {
  /**
   * @param $q
   * @param {LabeledThingGateway} labeledThingGateway
   */
  constructor($q, labeledThingGateway) {
    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;
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
        return this._labeledThingGateway.getAssociatedLabeledThingsInFrames(task, labeledThing);
      }).then(documents => {
        return documents.rows.filter(document => {
          return (document.doc.frameIndex >= newStartFrameIndex && document.doc.frameIndex <= newEndFrameIndex);
        });
      }).then(documentOutsideRange => {
        return !(documentOutsideRange.length === 0);
      });
  }
}

LabeledThingReferentialCheckService.$inject = [
  '$q',
  'labeledThingGateway',
];

export default LabeledThingReferentialCheckService;
