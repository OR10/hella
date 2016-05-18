import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import Cuboid3d from '../Models/Cuboid3d';

class PaperCuboid extends PaperShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {DepthBuffer} depthBuffer
   * @param {Array} cuboid3dPoints
   * @param {String} color
   * @param {boolean} draft
   */
  constructor(labeledThingInFrame, shapeId, depthBuffer, cuboid3dPoints, color, draft) {
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
     * @type {DepthBuffer}
     * @private
     */
    this._depthBuffer = depthBuffer;

    /**
     * @type {Array.<paper.Path>}
     * @private
     */
    this._edges = this._createEdges(new Cuboid3d(cuboid3dPoints));

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
   * @param {Cuboid3d} cuboid3d
   * @private
   */
  _createEdges(cuboid3d) {
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
      {from: 0, to: 4}, // Front top left -> back top right
      {from: 1, to: 5}, // Front top right -> back top left
      {from: 2, to: 6}, // Front bottom right -> back bottom left
      {from: 3, to: 7}, // Front bottom left -> back bottom right
    ];

    const projectedCuboid = this._depthBuffer.projectCuboidWithDepth(cuboid3d);

    return edgeIndices.map((edgePointIndex) => {
      const from = projectedCuboid.vertices[edgePointIndex.from];
      const to = projectedCuboid.vertices[edgePointIndex.to];
      const hidden = (!projectedCuboid.vertexVisibility[edgePointIndex.from] || !projectedCuboid.vertexVisibility[edgePointIndex.to]);

      return new paper.Path.Line({
        from: this._vectorToPaperPoint(from),
        to: this._vectorToPaperPoint(to),
        strokeColor: this._color,
        selected: false,
        strokeWidth: 2,
        strokeScaling: false,
        dashArray: hidden ? [2, 2] : [],
      });
    });
  }

  /**
   * @param {THREE.Vector3} vector
   * @private
   */
  _vectorToPaperPoint(vector) {
    return new paper.Point(Math.round(vector.x), Math.round(vector.y));
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
