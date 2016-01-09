import DataContainer from './DataContainer';

class LabeledThingInFrameDataContainer extends DataContainer {
  /**
   * @param {LabeledThing} labeledThing
   */
  invalidateLabeledThing(labeledThing) {
    const locatorFunction = element => element.labeledThing.id === labeledThing.id;

    for (let frameData of this._data.values()) {
      const index = frameData.findIndex(locatorFunction);

      if (index > -1) {
        frameData.splice(index, 1);
      }
    }
  }
}

export default LabeledThingInFrameDataContainer;
