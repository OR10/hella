/**
 * A model representing the xml class element.
 *
 * Besides the class element node it also stores its relative depth in the xml dom tree.
 */
class XMLClassElement {
  /**
   * @param {Node} element
   * @param {int} depth
   */
  constructor(element, depth) {
    this._element = element;
    this._depth = depth;
  }

  /**
   * @return {Node}
   */
  get element() {
    return this._element;
  }

  /**
   * @return {int}
   */
  get depth() {
    return this._depth;
  }
}

export default XMLClassElement;