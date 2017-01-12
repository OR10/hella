import clone from 'lodash.clone';
import cloneDeep from 'lodash.clonedeep';

import LabeledThingInFrame from '../Models/LabeledThingInFrame';

class GhostingService {
  constructor() {
  }

  /**
   *
   * @param {int} frameIndex
   * @param {int} offset
   * @param {int} limit
   * @param {Array.<LabeledThingInFrame>} labeledThingsInFrames
   */
  calculateShapeGhostsForLabeledThingInFrames(frameIndex, offset, limit, labeledThingsInFrames) {
    if (labeledThingsInFrames.length === 0) {
      return labeledThingsInFrames;
    }
    const startKey = frameIndex + offset;
    const endKey = frameIndex + offset + limit;

    // Create a lookup table mapping frame index to ltif
    const labeledThingInFrameLookUpTable = new Map();
    labeledThingsInFrames.forEach(ltif => labeledThingInFrameLookUpTable.set(ltif.frameIndex, ltif));

    let foundLtif = null;
    let result = [];
    let counter = 0;

    // Walk through all frame indices in reverse order
    for (let index = endKey; index >= 0; index--, counter++) {
      // If there is a ltif for the current frame index start ghost creation
      if (labeledThingInFrameLookUpTable.has(index) || index === 0) {
        foundLtif = labeledThingInFrameLookUpTable.get(index);
        // Create clones of found ltif from current frameindex up to the last found/end
        let partialLabeledThingInFrameSequence = new Array(counter).fill(foundLtif);
        // Update frame indices for ghost ltifs and concat to result ltif array
        partialLabeledThingInFrameSequence = partialLabeledThingInFrameSequence.map(this._createGhostLabeledThingInFrameForPartialSequence);
        result = partialLabeledThingInFrameSequence.concat(result);
        counter = 0;
      }
    }
    return result.slice(startKey, endKey);
  }

  /**
   * @param {Array.<LabeledThingInFrame>} labeledThingsInFrames
   */
  calculateClassGhostsForLabeledThingsInFrames(labeledThingsInFrames) {
    const result = cloneDeep(labeledThingsInFrames);
    let counter = 0;

    for (let globalIndex = labeledThingsInFrames.length - 1; globalIndex >= 0; globalIndex--, counter++) {
      const currentLtif = labeledThingsInFrames[globalIndex];
      // Check if the ltif at the current index has classes
      if (currentLtif.ghostClasses === null && currentLtif.classes !== []) {
        // Set the classes of the current ltif as ghost classes of the following ltifs
        for (let localIndex = globalIndex + 1; localIndex < globalIndex + counter; localIndex++) {
          result[localIndex].ghostClasses = clone(currentLtif.classes);
        }
        counter = 0;
      }
    }

    return result;
  }

  /**
   * @param {LabeledThingInFrame} ltif
   * @param {int} localGhostIndex
   * @return {LabeledThingInFrame}
   * @private
   */
  _createGhostLabeledThingInFrameForPartialSequence(ltif, localGhostIndex) {
    if (localGhostIndex === 0) {
      return ltif;
    }

    return new LabeledThingInFrame({
      id: null,
      classes: [],
      ghostClasses: clone(ltif.classes),
      incomplete: false,
      frameIndex: ltif.frameIndex + localGhostIndex,
      labeledThing: ltif.labeledThing,
      identifierName: ltif.identifierName,
      shapes: cloneDeep(ltif.shapes),
      ghost: true,
    });
  }
}

export default GhostingService;
