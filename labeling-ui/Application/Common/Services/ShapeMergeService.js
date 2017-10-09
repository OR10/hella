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

  _filterLabeledThings(shapes, rootLabeledThing) {
    const labeledThings = [];

    shapes.forEach(shape => {
      const currentLabeledThing = shape.labeledThingInFrame.labeledThing;
      const isNotRootLabeledThing = currentLabeledThing !== rootLabeledThing;
      const labeledThingNotStored = labeledThings.findIndex(labeledThing => labeledThing === currentLabeledThing) === -1;

      if (isNotRootLabeledThing && labeledThingNotStored) {
        labeledThings.push(currentLabeledThing);
      }
    });

    return labeledThings;
  }

  _moveLabeledThingsInFrame(labeledThings, rootShape) {
    const rootLabeledThing = rootShape.labeledThingInFrame.labeledThing;
    const promises = [];

    labeledThings.forEach(labeledThing => {
      const ltPromise = this._labeledThingGateway.getAssociatedLabeledThingsInFrames(labeledThing)
        .then(labeledThingsInFrame => {
          const ltifPromises = [];

          labeledThingsInFrame.forEach(labeledThingInFrame => {
            labeledThingInFrame.labeledThing = rootLabeledThing;
            labeledThingInFrame.classes = rootShape.labeledThingInFrame.classes;
            labeledThingInFrame.incomplete = rootShape.labeledThingInFrame.incomplete;
            const ltifPromise = this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
            ltifPromises.push(ltifPromise);
          });

          return this._$q.all(ltifPromises);
        })
        .then(() => this._labeledThingGateway.deleteLabeledThing(labeledThing));

      promises.push(ltPromise);
    });

    return this._$q.all(promises);
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

    const labeledThings = this._filterLabeledThings(shapes, rootLabeledThing);

    return this._moveLabeledThingsInFrame(labeledThings, rootShape)
      .then(() => {
        this._$rootScope.$emit('shape:merge:after');
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