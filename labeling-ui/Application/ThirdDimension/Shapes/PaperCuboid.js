import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';

class PaperCuboid extends PaperShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Projection2d} projection
   * @param {Array} cuboid3dPoints
   * @param {String} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, projection, cuboid3dPoints, color, draft) {
    super(labeledThingInFrame, shapeId, draft);

    /**
     * @type {String}
     * @private
     */
    this._color = color;

    /**
     * @type {boolean}
     * @private
     */
    this._isSelected = false;

    /**
     * @type {Projection2d}
     * @private
     */
    this._projection = projection;

    /**
     * @type {Array.<paper.Path>}
     * @private
     */
    this._edges = this._createEdges(cuboid3dPoints);

    this._addChildren(this._edges);
  }

  /**
   * Add all edged to the shape group
   *
   * @param {Array.<paper.Path>} edges
   * @private
   */
  _addChildren(edges) {
    edges.forEach((edge) => {
      this.addChild(edge);
    });
  }

  /**
   * Create all edges of the cuboid
   *
   * @param cuboid3dPoints
   * @private
   */
  _createEdges(cuboid3dPoints) {
    const edgeIndices = [
      // Front
      {from: 0, to: 1}, // Top
      {from: 1, to: 2}, // Right
      {from: 2, to: 3}, // Bottom
      {from: 3, to: 0}, // Left
      // Back
      {from: 4, to: 5}, // Top
      {from: 5, to: 6}, // Right
      {from: 6, to: 7}, // Bottom
      {from: 7, to: 4},  // Left
      // Sides
      {from: 0, to: 5}, // Front top left -> back top right
      {from: 1, to: 4}, // Front top right -> back top left
      {from: 2, to: 7}, // Front bottom right -> back bottom left
      {from: 3, to: 6}, // Front bottom left -> back bottom right
    ];

    return edgeIndices.map((edgePointIndex) => {
      const from = this._vectorToPaperPoint(this._projection.project3dTo2d(cuboid3dPoints[edgePointIndex.from]));
      const to = this._vectorToPaperPoint(this._projection.project3dTo2d(cuboid3dPoints[edgePointIndex.to]));

      return new paper.Path.Line({
        from: from,
        to: to,
        strokeColor: this._color,
        selected: false,
        strokeWidth: 2,
        strokeScaling: false,
      });
    });
  }

  /**
   * @param {THREE.Vector3} vector
   * @private
   */
  _vectorToPaperPoint(vector) {
    return new paper.Point(vector.x, vector.y);
  }

  /**
   * Convert to JSON for Storage
   */
  toJSON() {
    // TODO: Implement
  }
}
PaperCuboid.DASH = [2, 2];

export default PaperCuboid;
