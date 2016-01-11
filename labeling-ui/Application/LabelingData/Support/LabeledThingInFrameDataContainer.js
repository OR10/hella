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
    const locatorFunction = element => element.labeledThing.id === labeledThing.id;

    for (const frameData of this._data.values()) {
      const index = frameData.findIndex(locatorFunction);

      if (index > -1) {
        frameData.splice(index, 1);
      }
    }
  }
}

export default LabeledThingInFrameDataContainer;
