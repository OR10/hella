import paper from 'paper';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import Cuboid3d from '../Models/Cuboid3d';

class PaperCuboid extends PaperShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Projection2d} projection2d
   * @param {Array} cuboid3dPoints
   * @param {String} color
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, projection2d, cuboid3dPoints, color, draft) {
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
    this._projection2d = projection2d;

    /**
     * @type {Cuboid3d}
     * @private
     */
    this._cuboid3d = new Cuboid3d(cuboid3dPoints);

    this._drawCuboid();
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
   * Generate the 2d projection of the {@link Cuboid3d} and add the corresponding shaped to this group
   *
   * @private
   */
  _drawCuboid() {
    const projectedCuboid = this._projection2d.projectCuboidTo2d(this._cuboid3d);
    const lines = this._generateEdges(projectedCuboid);
    const planes = this._generatePlanes(projectedCuboid);

    this.removeChildren();
    this._addChildren(lines);
    this._addChildren(planes);
  }

  /**
   *
   * @param {Cuboid2d} cuboid2d
   * @returns {Array}
   * @private
   */
  _generateEdges(cuboid2d) {
    const edges = [
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

    return edges.map((edgePointIndex) => {
      const from = cuboid2d.vertices[edgePointIndex.from];
      const to = cuboid2d.vertices[edgePointIndex.to];
      const hidden = (!cuboid2d.vertexVisibility[edgePointIndex.from] || !cuboid2d.vertexVisibility[edgePointIndex.to]);
      const primary = (cuboid2d.primaryVertices[edgePointIndex.from] && cuboid2d.primaryVertices[edgePointIndex.to] && this._isSelected);

      return new paper.Path.Line({
        from: this._vectorToPaperPoint(from),
        to: this._vectorToPaperPoint(to),
        strokeColor: primary ? this._color.primary : this._color.secondary,
        selected: false,
        strokeWidth: 2,
        strokeScaling: false,
        dashArray: hidden ? PaperCuboid.DASH : PaperCuboid.LINE,
      });
    });
  }

  /**
   * @param {Cuboid2d} cuboid2d
   * @private
   */
  _generatePlanes(cuboid2d) {
    const planes = [
      [0, 1, 2, 3],
      [1, 5, 6, 2],
      [4, 0, 3, 7],
      [4, 5, 6, 7],
      [4, 5, 1, 0],
      [7, 6, 2, 3],
    ];

    const visiblePlanes = planes.filter(plane => plane.filter(vertex => cuboid2d.vertexVisibility[vertex]).length === 4);

    return visiblePlanes.map(plane => {
      const points = plane.map(index => new paper.Point(cuboid2d.vertices[index].x, cuboid2d.vertices[index].y));

      return new paper.Path({
        selected: false,
        strokeWidth: 0,
        fillColor: new paper.Color(0, 0, 0, 0),
        segments: points,
        closed: true,
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
   * @param hitResult
   * @returns {boolean}
   */
  shouldBeSelected(hitResult) {
    return true;
  }

  /**
   * Select the shape
   *
   * @param {Boolean} handles
   */
  select(handles = true) {
    this._isSelected = true;
    this._drawCuboid();
  }

  /**
   * Deselect the shape
   */
  deselect() {
    this._isSelected = false;
    this._drawCuboid();
  }

  /**
   * Overwrite the `hasFill` for this group to ensure a hitTest matches :>
   *
   * @returns {boolean}
   */
  hasFill() {
    return true;
  }

  /**
   * Convert to JSON for Storage
   */
  toJSON() {
    // TODO: Implement
  }
}
PaperCuboid.DASH = [2, 2];
PaperCuboid.LINE = [];

export default PaperCuboid;
