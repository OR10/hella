import uuid from 'uuid';

/**
 * Interpolation base class, for all {@link Interpolation}s, which are executed on the backend
 *
 * @implements Interpolation
 * @abstract
 */
class FrontendInterpolation {
  /**
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {angular.$q} $q
   * @param {InterpolationEasing[]} easings
   */
  constructor(labeledThingInFrameGateway, $q, ...easings) {
    /**
     * @type {LabeledThingInFrameGateway}
     * @private
     */
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;

    /**
     * @type {angular.$q}
     * @private
     */
    this._$q = $q;

    /**
     * @type {InterpolationEasing[]}
     * @private
     */
    this._easings = easings;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {FrameRange} frameRange
   */
  execute(task, labeledThing, frameRange) {
    const limit = (frameRange.endFrameIndex - frameRange.startFrameIndex) + 1;
    this._labeledThingInFrameGateway.getLabeledThingInFrame(
      task,
      frameRange.startFrameIndex,
      labeledThing,
      0,
      limit
    ).then(labeledThingInFramesWithGhosts => {
      if (labeledThingInFramesWithGhosts.length === 0) {
        throw new Error('Error in _doInterpolation: Insufficient labeled things in frame ghosts');
      }

      if (frameRange.endFrameIndex - frameRange.startFrameIndex < 2) {
        throw new Error(`Error in _doInterpolation: endFrameIndex (${frameRange.endFrameIndex}) - startFrameIndex (${frameRange.startFrameIndex}) < 2`);
      }

      const labeledThingInFrames = labeledThingInFramesWithGhosts.filter(labeledThingInFrame => {
        return labeledThingInFrame.ghost === false;
      });

      if (labeledThingInFrames.length <= 1) {
        throw new Error('Error in _doInterpolation: You need more then 1 real labeledThingInFrames for interpolation');
      }

      const labeledThingInFrameIndices = labeledThingInFrames.map(labeledThingInFrame => labeledThingInFrame.frameIndex);

      const easing = this._getEasingForShapeAndType(labeledThingInFrames[0]);

      const savePromises = [];
      labeledThingInFrameIndices.forEach((currentLtifIndex, ltifIndicesIndex) => {
        if (labeledThingInFrameIndices[ltifIndicesIndex + 1] !== undefined) {
          const startLtif = labeledThingInFrames[ltifIndicesIndex];
          const endLtif = labeledThingInFrames[ltifIndicesIndex + 1];
          if (startLtif.frameIndex + 1 === endLtif.frameIndex) {
            return;
          }

          const endLtifIndex = labeledThingInFrameIndices[ltifIndicesIndex + 1];
          const steps = [];
          for (let index = 1; index < (endLtifIndex - currentLtifIndex); index++) {
            steps.push(ltifIndicesIndex + index);
          }

          steps.forEach((step, stepIndex) => {
            const currentGhost = labeledThingInFramesWithGhosts[step];
            const delta = (stepIndex + 1) / (steps.length + 1);

            easing.step(currentGhost, startLtif, endLtif, delta);

            const transformedGhost = this._transformGhostToLabeledThing(currentGhost);
            savePromises.push(this._saveLabeledThingInFrame(transformedGhost));
          });
        }
      });

      return this._$q.all(savePromises);
    });
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} easingType
   * @returns {*}
   * @private
   */
  _getEasingForShapeAndType(labeledThingInFrame, easingType = 'linear') {
    const shape = labeledThingInFrame.shapes[0].type;
    const interpolationEasing = this._easings.find(easing => easing.supportsShape(shape) && easing.supportsEasing(easingType));
    if (interpolationEasing === undefined) {
      throw new Error(`There is no easing for ${shape} with type ${easingType}`);
    }

    return interpolationEasing;
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _transformGhostToLabeledThing(labeledThingInFrame) {
    labeledThingInFrame.ghostBust(uuid.v4(), labeledThingInFrame.frameIndex);

    return labeledThingInFrame;
  }

  /**
   * @param labeledThingInFrame
   * @private
   */
  _saveLabeledThingInFrame(labeledThingInFrame) {
    return this._labeledThingInFrameGateway.saveLabeledThingInFrame(labeledThingInFrame);
  }
}

FrontendInterpolation.$inject = [
  'labeledThingInFrameGateway',
  '$q',
  'linearRectangleInterpolationEasing',
  'linearPedestrianInterpolationEasing',
  'linearPolyInterpolationEasing',
  'linearPointInterpolationEasing',
  'linearCuboidInterpolationEasing',
];

export default FrontendInterpolation;