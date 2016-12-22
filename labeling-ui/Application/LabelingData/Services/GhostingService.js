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
  calculateGhostsForLabeledThingInFrames(frameIndex, offset, limit, labeledThingsInFrames) {
    const startkey = frameIndex + offset;
    const endkey = frameIndex + offset + limit;

    const labeledThingInFrameLookUpTable = new Map();
    labeledThingsInFrames.forEach(ltif => labeledThingInFrameLookUpTable.set(ltif.frameIndex, ltif));

    let foundLtif = null;
    let result = [];
    let counter = 0;
    for (let index = endkey; index >= 0; index--, counter++) {
      if (labeledThingInFrameLookUpTable.has(index) || index === 0) {
        foundLtif = labeledThingInFrameLookUpTable.get(index);
        let partialLabeledThingInFrameSequence = new Array(counter).fill(foundLtif);
        partialLabeledThingInFrameSequence = partialLabeledThingInFrameSequence.map(this._createGhostLabeledThingInFrameForPartialSequence);
        result = partialLabeledThingInFrameSequence.concat(result);
        counter = 0;
      }
    }
    return result.slice(startkey, endkey);
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
