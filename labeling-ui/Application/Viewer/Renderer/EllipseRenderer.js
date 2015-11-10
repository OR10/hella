import paper from 'paper';

/**
 * Renderer used to draw and manipulate ellipse shapes
 *
 * @class EllipseRenderer
 */
export default class EllipseRenderer {
  constructor() {

  }

  /**
   * Draws a ellipse defined by the given points.
   *
   * @param {paper.Point} from
   * @param {paper.Point} to
   * @param {Object} options
   */
  drawEllipse(point, size, options) {
    const params = Object.assign({}, options, {point, size});

    return new paper.Path.Ellipse(params);
  }

  /**
   *
   * @param {paper.Point} center
   * @param {int} radius
   * @param {Object} options
   */
  drawCircle(center, radius, options) {
    const params = Object.assign({}, options, {center, radius});

    return new paper.Path.Circle(params);
  }
}
