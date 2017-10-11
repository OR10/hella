import LabeledThing from 'Application/LabelingData/Models/LabeledThing';

class CutService {
  /**
   * @param {angular.$q} $q
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {EntityIdService} entityIdService
   * @param {EntityColorService} entityColorService
   */
  constructor(
    $q,
    labeledThingGateway,
    labeledThingInFrameGateway,
    entityIdService,
    entityColorService
  ) {
    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {EntityIdService}
     * @private
     */
    this._entityIdService = entityIdService;

    /**
     * @type {EntityColorService}
     * @private
     */
    this._entityColorService = entityColorService;
  }

  /**
   * @param labeledThing
   * @param labeledThingInFrame
   * @param frameIndex
   */
  cutShape(labeledThing, labeledThingInFrame, frameIndex) {
    const task = labeledThingInFrame.task;
    let previousLabeledThingInFrame;
    const newLabeledThing = new LabeledThing({
      id: this._entityIdService.getUniqueId(),
      lineColor: this._entityColorService.getColorId(),
      classes: [],
      incomplete: true,
      task: task,
      frameRange: {
        startFrameIndex: frameIndex,
        endFrameIndex: labeledThing.frameRange.endFrameIndex,
      },
    });

    return this._preconditionFulfilled(task, labeledThing, frameIndex)
      .then(() => {
        return this._labeledThingInFrameGateway.getLabeledThingInFrame(task, frameIndex - 1, labeledThing);
      })
      .then(oldLabeledThingInFrame => {
        previousLabeledThingInFrame = oldLabeledThingInFrame[0];
        return this._labeledThingGateway.saveLabeledThing(newLabeledThing);
      })
      .then(() => {
        return this._labeledThingInFrameGateway.listLabeledThingInFrame(
          task,
          frameIndex,
          0,
          labeledThing.frameRange.endFrameIndex
        );
      })
      .then(ltifs => {
        const promises = [];
        let ghostInherited = false;
        ltifs.forEach(ltif => {
          if (ltif._labeledThing.id === labeledThing.id) {
            if (!ghostInherited && ltif.classes.length === 0) {
              if (previousLabeledThingInFrame.classes.length > 0) {
                ltif.classes = previousLabeledThingInFrame.classes;
              }
              if (previousLabeledThingInFrame.ghostClasses !== null && previousLabeledThingInFrame.ghostClasses.length > 0) {
                ltif.classes = previousLabeledThingInFrame.ghostClasses;
              }
              ghostInherited = true;
            }

            ltif._labeledThing = newLabeledThing;
            promises.push(this._labeledThingInFrameGateway.saveLabeledThingInFrame(ltif));
          }
        });

        return this._$q.all(promises);
      })
      .then(() => {
        labeledThing.frameRange.endFrameIndex = frameIndex - 1;
        return this._labeledThingGateway.saveLabeledThing(labeledThing);
      })
      .then(() => {
        return newLabeledThing;
      });
  }

  /**
   * @param task
   * @param labeledThing
   * @param frameIndex
   * @private
   */
  _preconditionFulfilled(task, labeledThing, frameIndex) {
    return this._$q.resolve()
      .then(() => {
        if (labeledThing.frameRange.startFrameIndex === frameIndex) {
          return this._$q.reject('You can not cut the shape on the first frame range');
        }
        if (labeledThing.frameRange.startFrameIndex > frameIndex || labeledThing.frameRange.endFrameIndex < frameIndex) {
          return this._$q.reject('You can not cut the shape outside the frame range');
        }
        return this._$q.resolve();
      })
      .then(() => {
        return this._labeledThingInFrameGateway.listLabeledThingInFrame(
          task,
          labeledThing.frameRange.startFrameIndex,
          0,
          frameIndex
        );
      })
      .then(ltifs => {
        if (ltifs.length === 0) {
          return this._$q.reject('You can not cut the shape here because there are no more shapes remaining on the left side');
        }
        return this._$q.resolve();
      }).then(() => {
        return this._labeledThingInFrameGateway.listLabeledThingInFrame(
          task,
          frameIndex,
          0,
          labeledThing.frameRange.endFrameIndex
        );
      })
      .then(ltifs => {
        if (ltifs.length === 0) {
          return this._$q.reject('You can not cut the shape here because there are no more shapes remaining on the right side');
        }
        return this._$q.resolve();
      });
  }
}


CutService.$inject = [
  '$q',
  'labeledThingGateway',
  'labeledThingInFrameGateway',
  'entityIdService',
  'entityColorService',
];

export default CutService;
