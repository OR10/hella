import paper from 'paper';

/**
 * Renderer used to draw and manipulate ellipse shapes
 */
export default class EllipseRenderer {

  /**
   * Draws a ellipse defined by the given points.
   *
   * @param {paper.Point} center
   * @param {paper.Point} size
   * @param {Object} options
   */
  drawEllipse(center, size, options) {
    const params = Object.assign({}, options, {center, size});

    return new paper.Path.Ellipse(params);
  }

  /**
   * Draws a circle around the center point with the given radius
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
