import paper from 'paper';

/**
 * Renderer used to draw and manipulate rectangular shapes
 *
 * @class RectangleRenderer
 */
export default class RectangleRenderer {
  constructor() {

  }

  /**
   * Draws a rectangle defined by the given points.
   *
   * @param {paper.Point} from
   * @param {paper.Point} to
   * @param {Object} options
   */
  drawRectangle(from, to, options) {
    const params = Object.assign({}, options, {from, to});

    return new paper.Path.Rectangle(params);
  }
}
