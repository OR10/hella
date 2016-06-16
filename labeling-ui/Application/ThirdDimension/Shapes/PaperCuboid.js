import paper from 'paper';
import {Vector3, Matrix4} from 'three-math';
import _ from 'lodash';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import RectangleHandle from '../../Viewer/Shapes/Handles/Rectangle';

import Cuboid3d from '../Models/Cuboid3d';

class PaperCuboid extends PaperShape {

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Projection2d} projection2d
   * @param {Projection3d} projection3d
   * @param {Array} cuboid3dPoints
   * @param {String} color
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, projection2d, projection3d, cuboid3dPoints, color, draft) {
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
     * @type {Projection3d}
     * @private
     */
    this._projection3d = projection3d;

    /**
     * @type {null}
     * @private
     */
    this._projectedCuboid = null;

    /**
     * @type {Cuboid3d}
     * @private
     */
    this._cuboid3d = new Cuboid3d(cuboid3dPoints);

    /**
     * @type {{vertices, names, edge}}
     * @private
     */
    this._primaryVertices = this._cuboid3d.getPrimaryVertices();

    this._drawCuboid();
  }

  /**
   * Generate the 2d projection of the {@link Cuboid3d} and add the corresponding shaped to this group
   *
   * @param {boolean} drawHandles
   * @private
   */
  _drawCuboid(drawHandles = true) {
    this._projectedCuboid = this._projection2d.projectCuboidTo2d(this._cuboid3d);

    this.removeChildren();

    const planes = this._createPlanes();
    this.addChildren(planes);

    const lines = this._createEdges();
    this.addChildren(lines);

    if (this._isSelected && drawHandles) {
      const handles = this._createHandles();
      this.addChildren(handles);
    }
  }

  /**
   * @returns {Array}
   * @private
   */
  _createEdges() {
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
      const from = this._projectedCuboid.vertices[edgePointIndex.from];
      const to = this._projectedCuboid.vertices[edgePointIndex.to];
      const hidden = (!this._projectedCuboid.vertexVisibility[edgePointIndex.from] || !this._projectedCuboid.vertexVisibility[edgePointIndex.to]);
      const showPrimaryEdge = (this._primaryVertices.vertices[edgePointIndex.from] && this._primaryVertices.vertices[edgePointIndex.to] && this._isSelected);

      return new paper.Path.Line({
        from: this._vectorToPaperPoint(from),
        to: this._vectorToPaperPoint(to),
        strokeColor: showPrimaryEdge ? this._color.secondary : this._color.primary,
        selected: false,
        strokeWidth: 2,
        strokeScaling: false,
        dashArray: hidden ? PaperShape.DASH : PaperShape.LINE,
      });
    });
  }

  /**
   * @private
   */
  _createPlanes() {
    const planes = [
      [0, 1, 2, 3],
      [1, 5, 6, 2],
      [4, 0, 3, 7],
      [4, 5, 6, 7],
      [4, 5, 1, 0],
      [7, 6, 2, 3],
    ];

    const visiblePlanes = planes.filter(plane => plane.filter(vertex => this._projectedCuboid.vertexVisibility[vertex]).length === 4);

    return visiblePlanes.map(plane => {
      const points = plane.map(index => new paper.Point(this._projectedCuboid.vertices[index].x, this._projectedCuboid.vertices[index].y));

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
   * @private
   */
  _createHandles() {
    const handles = [];

    this._primaryVertices.vertices.forEach(
      (isPrimaryVertex, index) => {
        if (!isPrimaryVertex) {
          return;
        }

        const vertex = this._projectedCuboid.vertices[index];

        handles.push(
          new RectangleHandle(
            'cube-' + this._primaryVertices.names[index],
            '#ffffff',
            this._handleSize,
            this._vectorToPaperPoint(vertex)
          )
        );
      }
    );

    return handles;
  }

  /**
   * @param {THREE.Vector3} vector
   * @private
   */
  _vectorToPaperPoint(vector) {
    return new paper.Point(vector.x, vector.y);
  }

  get bounds() {
    const minX = this._projectedCuboid.vertices.reduce((prev, current) => {
      return prev.x < current.x ? prev.x : current.x;
    });
    const minY = this._projectedCuboid.vertices.reduce((prev, current) => {
      return prev.y < current.y ? prev.y : current.y;
    });
    const maxX = this._projectedCuboid.vertices.reduce((prev, current) => {
      return prev.x > current.x ? prev.x : current.x;
    });
    const maxY = this._projectedCuboid.vertices.reduce((prev, current) => {
      return prev.y > current.y ? prev.y : current.y;
    });

    return {
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  updatePrimaryCorner() {
    this._primaryVertices = this._cuboid3d.getPrimaryVertices();
    this._drawCuboid();
  }

  /**
   * Select the shape
   *
   * @param {Boolean} drawHandles
   */
  select(drawHandles = true) {
    this._isSelected = true;
    this._drawCuboid(drawHandles);
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
   * @returns {string}
   */
  getClass() {
    return 'cuboid';
  }

  /**
   * Return the identifier for the tool action that need to be performed
   *
   * @param {Handle|null} handle
   * @returns {string|null}
   */
  getToolActionIdentifier(handle) {
    if (handle === null) {
      return null;
    }

    switch (handle.name) {
      case 'cube-height':
      case 'cube-width':
      case 'cube-length':
        return 'scale';
      case 'cube-move':
        return 'move';
      default:
        return null;
    }
  }

  /**
   * @param {Handle|null} handle
   * @returns {string}
   */
  getCursor(handle) {
    if (handle === null) {
      return 'pointer';
    }

    switch (handle.name) {
      case 'cube-height':
        return 'ns-resize';
      case 'cube-width':
      case 'cube-length':
        return 'all-scroll';
      case 'cube-move':
        return 'grab';
      default:
        return 'pointer';
    }
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    const newPrimaryCornerPosition = this._projection3d.projectBottomCoordinateTo3d(new Vector3(point.x, point.y, 1));
    const movementVector = newPrimaryCornerPosition.sub(this._cuboid3d.vertices[this._primaryVertices.cornerIndex]);

    // console.log(newPrimaryCornerPosition, this._cuboid3d.vertices[this._primaryVertices.cornerIndex], movementVector);
    this._cuboid3d.moveBy(movementVector);

    this._drawCuboid();
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {{height: 1, width: 1, length: 1}} minDistance
   */
  resize(handle, point, minDistance = {height: 1, width: 1, length: 1}) {
    switch (handle.name) {
      case 'cube-height':
        this._changeHeight(point, minDistance);
        break;
      case 'cube-width':
        break;
      case 'cube-length':
        break;
      default:
        throw new Error(`Unknown handle type: ${handle}.`);
    }

    this._drawCuboid();
  }

  /**
   * @param {number} degree
   */
  rotateArroundCenterBy(degree) {
    const radians = ((2 * Math.PI) / 360) * degree;

    // Create translation and rotation matrices
    const translation = new Matrix4();
    const inverseTranslation = new Matrix4();
    const rotation = new Matrix4();

    // Create translation vectors
    const transVector = this._cuboid3d.bottomCenter.negate();
    const invTransVector = this._cuboid3d.bottomCenter;

    // Calculate translation and rotation
    translation.makeTranslation(transVector.x, transVector.y, transVector.z);
    inverseTranslation.makeTranslation(invTransVector.x, invTransVector.y, invTransVector.z);
    rotation.makeRotationZ(radians);

    this._cuboid3d = Cuboid3d.createFromVectors(
      this._cuboid3d.vertices.map(
        // Apply translation and rotation
        vertex => vertex.applyMatrix4(translation).applyMatrix4(rotation).applyMatrix4(inverseTranslation)
      )
    );

    this._drawCuboid();
  }

  /**
   * @param {Point} point
   * @param {{height: 1, width: 1, length: 1}} minDistance
   * @private
   */
  _changeHeight(point, minDistance) { // eslint-disable-line no-unused-vars
    const newTop = this._projection3d.projectTopCoordianteTo3d(
      new Vector3(point.x, point.y, 1),
      this._cuboid3d.vertices[this._primaryVertices.cornerIndex]
    );

    let oldTop;
    _.each(this._primaryVertices.names, (value, key) => {
      if (value === 'height') {
        oldTop = this._cuboid3d.vertices[key];
      }
    });
    const heightVector = newTop.sub(oldTop);
    this._cuboid3d.addVectorToTop(heightVector);
  }

  /**
   * Convert to JSON for Storage
   */
  toJSON() {
    return {
      type: 'cuboid3d',
      id: this._shapeId,
      vehicleCoordinates: this._cuboid3d.vertices.map(vertex => [vertex.x, vertex.y, vertex.z]),
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

export default PaperCuboid;
