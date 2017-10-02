class ShapeMergeService {
  /**
   * @param {$q} $q
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   */
  constructor($q, labeledThingInFrameGateway) {
    /**
     * @type {$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
  }

  mergeShapes(shapes) {
    const rootShape = shapes[0];
    const rootLabeledThing = rootShape.labeledThingInFrame.labeledThing;

    const promises = [];

    shapes.forEach(shape => {
      shape.labeledThingInFrame.labeledThing = rootLabeledThing;
      const shapePromise =  this._labeledThingInFrameGateway.saveLabeledThingInFrame(shape.labeledThingInFrame);
      promises.push(shapePromise);
    });

    return this._$q.all(promises);
  }
}

ShapeMergeService.$inject = [
  '$q',
  'labeledThingInFrameGateway',
];

export default ShapeMergeService;