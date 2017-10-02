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

  /**
   * @param {Array.<PaperThingShape>} shapes
   * @return {Promise}
   */
  mergeShapes(shapes) {
    const rootShape = shapes[0];
    const rootLabeledThing = rootShape.labeledThingInFrame.labeledThing;
    const newFrameRange = this._calculcateFrameRange(shapes);
    rootLabeledThing.frameRange = Object.assign({}, rootLabeledThing.frameRange, newFrameRange);

    const promises = [];

    shapes.forEach(shape => {
      shape.labeledThingInFrame.labeledThing = rootLabeledThing;
      shape.labeledThingInFrame.classes = rootShape.labeledThingInFrame.classes;

      const shapePromise =  this._labeledThingInFrameGateway.saveLabeledThingInFrame(shape.labeledThingInFrame);
      promises.push(shapePromise);
    });

    return this._$q.all(promises);
  }

  /**
   * Calculates the new frame range for the merged LT
   *
   * @param shapes
   * @return {{startFrameIndex: number, endFrameIndex: number}}
   * @private
   */
  _calculcateFrameRange(shapes) {
    let startFrameIndex = 0;
    let endFrameIndex = 0;

    shapes.forEach(shape => {
      const labeledThing = shape.labeledThingInFrame.labeledThing;

      if (labeledThing.frameRange.startFrameIndex < startFrameIndex) {
        startFrameIndex = labeledThing.frameRange.startFrameIndex;
      }

      if (labeledThing.frameRange.endFrameIndex > endFrameIndex) {
        endFrameIndex = labeledThing.frameRange.endFrameIndex;
      }
    });

    return {
      startFrameIndex,
      endFrameIndex,
    };
  }
}

ShapeMergeService.$inject = [
  '$q',
  'labeledThingInFrameGateway',
];

export default ShapeMergeService;