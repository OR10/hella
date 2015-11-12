import paper from 'paper';

/**
 * Renderer used to draw and manipulate ellipse shapes
 *
 * @class EllipseRenderer
 */
export default class PolygonRenderer {
  constructor() {

  }

  /**
   * Draws a ellipse defined by the given points.
   *
   * @param {paper.Point} from
   * @param {Object} options
   */
  drawPolygon(segments, options) {
    const params = Object.assign({}, options, {segments, closed: true});

    return new paper.Path(params);
  }
}
