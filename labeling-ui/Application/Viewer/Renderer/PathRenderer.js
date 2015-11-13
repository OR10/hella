import paper from 'paper';

/**
 * Renderer used to draw paths
 *
 * @class PathRenderer
 */
export default class PathRenderer {
  constructor() {

  }

  /**
   * Draws a closed polygon defined by the given points.
   *
   * @param {paper.Point} from
   * @param {Object} options
   */
  drawPolygon(segments, options) {
    const params = Object.assign({}, options, {segments, closed: true});

    return new paper.Path(params);
  }

  /**
   * Draws a open polygon defined by the given points.
   *
   * @param {Array.<paper.Point>} segments
   * @param {Object} options
   */
  drawPath(segments, options) {
    const params = Object.assign({}, options, {segments, closed: false});

    return new paper.Path(params);
  }

  /**
   * Draws a line between two points
   *
   * @param from
   * @param to
   * @param options
   * @returns {exportPath|h|*}
   */
  drawLine(from, to, options) {
    const segments = [from, to];
    const params = Object.assign({}, options, {segments, closed: false});

    return new paper.Path(params);
  }
}
