import PaperShape from '../Shapes/PaperShape';
import Handle from '../Shapes/Handles/Handle';

/**
 * Service, which resolves hit tests to specific PaperShapes or Handles
 *
 * This service takes hits on certain shapes, which might be part of a drawn shape and resolves them back to their
 * origin (PaperShape or Handle)
 */
class HitResolverService {
  constructor() {
    /**
     * @type {Array.<Function>}
     * @private
     */
    this._targets = [
      PaperShape,
      Handle,
    ];
  }

  /**
   * Retrieve an array of resolved shapes
   *
   * The array will always contain the whole resolved chain from parent to last child.
   *
   * Currently this can only be `[PaperShape]` or `[PaperShape, Handle]`.
   *
   * @param item
   * @returns {*}
   */
  resolve(item) {
    const matches = [];
    let current = item;
    while (current !== null && current !== undefined) {
      if (this._isTarget(current)) {
        matches.push(current);
      }

      current = current.parent;
    }

    if (matches.length === 0) {
      throw new Error(`Could not resolve hitTest item to one of the specified target classes`);
    }

    matches.reverse();
    return matches;
  }

  /**
   * @param {paper.Item} item
   * @returns {boolean}
   * @private
   */
  _isTarget(item) {
    for (let index = 0; index < this._targets.length; index++) {
      const target = this._targets[index];

      if (item instanceof target) {
        return true;
      }
    }

    return false;
  }
}

export default new HitResolverService();
