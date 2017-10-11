class ShapeMergeService {
  /**
   * @param {$rootScope} $rootScope
   * @param {$r} $q
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {ModalService} modalService
   * @param {SelectionDialog} SelectionDialog
   */
  constructor($rootScope, $q, labeledThingInFrameGateway, labeledThingGateway, modalService, SelectionDialog) {
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

    /**
     * @type {ModalService}
     * @private
     */
    this._modalService = modalService;

    /**
     * @type {SelectionDialog}
     * @private
     */
    this._SelectionDialog = SelectionDialog;
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

  _moveLabeledThingsInFrame(labeledThings, rootShape, rootLabeledThingsInFrame) {
    const rootFrames = rootLabeledThingsInFrame.map(labeledThingInFrame => labeledThingInFrame.frameIndex);

    const rootLabeledThing = rootShape.labeledThingInFrame.labeledThing;
    const promises = [];

    labeledThings.forEach(labeledThing => {
      const ltPromise = this._labeledThingGateway.getAssociatedLabeledThingsInFrames(labeledThing)
        .then(labeledThingsInFrame => {
          const ltifPromises = [];

          labeledThingsInFrame.forEach(labeledThingInFrame => {
            const rootAlreadyHasLabeledThingInFrameOnFrame = rootFrames.includes(labeledThingInFrame.frameIndex);

            if (rootAlreadyHasLabeledThingInFrameOnFrame) {
              return;
            }

            labeledThingInFrame.labeledThing = rootLabeledThing;
            labeledThingInFrame.classes = rootShape.labeledThingInFrame.classes;
            labeledThingInFrame.incomplete = rootShape.labeledThingInFrame.incomplete;
            const ltifPromise = this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
            ltifPromises.push(ltifPromise);
            rootFrames.push(labeledThingInFrame.frameIndex);
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
    const deferred = this._$q.defer();
    this._showSelectionModal(shapes, deferred);
    return deferred.promise;
  }

  _showSelectionModal(shapes, deferred) {
    const confirmCallback = shapeId => {
      this._mergeShapesWithRootShapeId(shapeId, shapes, deferred);
    };

    const abortCallback = () => {
      deferred.reject();
    };

    this._modalService.show(
      new this._SelectionDialog(
        {
          title: 'Select Target Shape',
          headline: `Please select the shape you want to merge all the other shapes into.`,
          message: 'The following shapes are available:',
          confirmButtonText: 'Accept and Merge',
          data: shapes,
        },
        confirmCallback,
        abortCallback,
        { selected: shapes[0].id }
      )
    );
  }

  _mergeShapesWithRootShapeId(shapeId, shapes, deferred) {
    if (shapeId) {
      const rootShape = shapes[shapeId];
      const rootLabeledThing = rootShape.labeledThingInFrame.labeledThing;
      const newFrameRange = this._calculcateFrameRange(shapes);
      rootLabeledThing.frameRange = Object.assign({}, rootLabeledThing.frameRange, newFrameRange);

      const labeledThings = this._filterLabeledThings(shapes, rootLabeledThing);

      this._labeledThingGateway.getAssociatedLabeledThingsInFrames(rootLabeledThing)
        .then(rootLabeledThingsInFrame => {
          return this._moveLabeledThingsInFrame(labeledThings, rootShape, rootLabeledThingsInFrame);
        })
        .then(() => {
          this._$rootScope.$emit('shape:merge:after');
          deferred.resolve();
        });
    } else {
      this._showSelectionModal(shapes, deferred);
    }
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
  'modalService',
  'SelectionDialog',
];

export default ShapeMergeService;