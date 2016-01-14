import DataContainer from './DataContainer';

/**
 * Specialized DataContainer providing a specific utility interface for managing a
 * set of {@link LabeledThingInFrame} data
 */
class LabeledThingInFrameDataContainer extends DataContainer {

  /**
   * Removes all data related to the given {@link LabeledThing} from this container
   *
   * @param {LabeledThing} labeledThing
   */
  invalidateLabeledThing(labeledThing) {
    const locatorFunction = this._getLabeledThingLocator(labeledThing);

    this._data.forEach(frameData => {
      const index = frameData.findIndex(locatorFunction);

      if (index > -1) {
        frameData.splice(index, 1);
      }
    });
  }

  /**
   * Updates all LabeledThingInFrame data associated with the given LabeledThing
   *
   * @param {LabeledThing} labeledThing
   * @param {Array<LabeledThingInFrame>} labeledThingInFrameData
   */
  setLabeledThingData(labeledThing, labeledThingInFrameData) {
    this.invalidateLabeledThing(labeledThing);

    const nonGhosts = labeledThingInFrameData.filter(element => !element.ghost);

    nonGhosts.forEach(labeledThingInFrame => {
      const frameNumber = labeledThingInFrame.frameNumber;

      if (this.has(frameNumber)) {
        this.get(frameNumber).push(labeledThingInFrame);
      } else {
        this.set(frameNumber, [labeledThingInFrame]);
      }
    });
  }

  /**
   * @param {LabeledThing} labeledThing
   * @returns {Function}
   *
   * @private
   */
  _getLabeledThingLocator(labeledThing) {
    return element => element.labeledThing.id === labeledThing.id;
  }
}

export default LabeledThingInFrameDataContainer;
