class ShapeMergeService {
  /**
   * @param {$rootScope} $rootScope
   * @param {$r} $q
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   */
  constructor($rootScope, $q, labeledThingInFrameGateway, labeledThingGateway) {
    /**
     * @type {$rootScope}
     * @private
     */
    this._$rootScope = $rootScope;

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

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;
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

    const labeledThings = [];
    const promises = [];

    shapes.forEach(shape => {
      labeledThings.push(shape.labeledThingInFrame.labeledThing);
      shape.labeledThingInFrame.labeledThing = rootLabeledThing;
      shape.labeledThingInFrame.classes = rootShape.labeledThingInFrame.classes;
      shape.labeledThingInFrame.incomplete = rootShape.labeledThingInFrame.incomplete;

      const shapePromise =  this._labeledThingInFrameGateway.saveLabeledThingInFrame(shape.labeledThingInFrame);
      promises.push(shapePromise);
    });

    return this._$q.all(promises).then(() => {
      const ltPromises = [];

      labeledThings.forEach(labeledThing => {
        const ltifPromise = this._labeledThingGateway.hasAssociatedLabeledThingsInFrames(labeledThing)
          .then(haslabeledThingsInFrame => {
            if (haslabeledThingsInFrame) {
              return this._labeledThingGateway.deleteLabeledThing(labeledThing);
            } else {
              return this._$q.resolve();
            }
          });

        ltPromises.push(ltifPromise);
      });

      return this._$q.all(ltPromises)
        .then(() => {
          this._$rootScope.$emit('shape:merge:after');
        });
    });
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
  '$rootScope',
  '$q',
  'labeledThingInFrameGateway',
  'labeledThingGateway',
];

export default ShapeMergeService;