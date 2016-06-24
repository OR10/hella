import paper from 'paper';
import {Vector3} from 'three-math';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import RectangleHandle from '../../Viewer/Shapes/Handles/Rectangle';

import Cuboid3d from '../Models/Cuboid3d';
import CuboidInteractionResolver from '../Support/CuboidInteractionResolver';
import ManualUpdateCuboidInteractionResolver from '../Support/ManualUpdateCuboidInteractionResolver';

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
    this._cuboid3d = Cuboid3d.createFromRawVertices(cuboid3dPoints);

    /**
     * @type {ManualUpdateCuboidInteractionResolver}
     * @private
     */
    this._cuboidInteractionResolver = new ManualUpdateCuboidInteractionResolver(this._cuboid3d);

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

    return edges.map(edgePointIndex => {
      const from = this._projectedCuboid.vertices[edgePointIndex.from];
      const to = this._projectedCuboid.vertices[edgePointIndex.to];
      const hidden = (!this._projectedCuboid.vertexVisibility[edgePointIndex.from] || !this._projectedCuboid.vertexVisibility[edgePointIndex.to]);
      const showPrimaryEdge = (this._cuboidInteractionResolver.isPrimaryVertex(edgePointIndex.from) && this._cuboidInteractionResolver.isPrimaryVertex(edgePointIndex.to) && this._isSelected);
      const predicted = (this._cuboid3d.nonPredictedVertices[edgePointIndex.from] === null || this._cuboid3d.nonPredictedVertices[edgePointIndex.to] === null);

      if (predicted) {
        // Do not render edges with predicted endpoints. Those are only used for calculations.
        return null;
      }

      return new paper.Path.Line({
        from: this._vectorToPaperPoint(from),
        to: this._vectorToPaperPoint(to),
        strokeColor: showPrimaryEdge ? this._color.secondary : this._color.primary,
        selected: false,
        strokeWidth: 2,
        strokeScaling: false,
        dashArray: hidden ? PaperShape.DASH : PaperShape.LINE,
      });
    })
      .filter(edge => edge !== null);
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

    const visiblePlanes = planes.filter(
      plane => plane.filter(
        vertexIndex => this._projectedCuboid.vertexVisibility[vertexIndex]
      ).length === 4
    );
    const visibleAndNonPredictedPlanes = visiblePlanes.filter(
      plane => plane.filter(
        vertexIndex => this._cuboid3d.nonPredictedVertices[vertexIndex] !== null
      ).length === 4
    );

    return visibleAndNonPredictedPlanes.map(plane => {
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

    [0, 1, 2, 3, 4, 5, 6, 7, 8].forEach(
      index => {
        if (!this._cuboidInteractionResolver.isPrimaryVertex(index)) {
          return;
        }

        if (this._cuboid3d.nonPredictedVertices[index] === null) {
          // The vertex is predicted and therefore not really there
          return;
        }

        const vertex = this._projectedCuboid.vertices[index];
        const name = this._cuboidInteractionResolver.getHandleNameFromInteraction(this._cuboidInteractionResolver.resolveInteractionForVertex(index));

        handles.push(
          new RectangleHandle(
            name,
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
    this._cuboidInteractionResolver.updateData();
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
    return PaperCuboid.getClass();
  }

  /**
   * Return the identifier for the tool action that need to be performed
   *
   * @param {Handle|null} handle
   * @returns {string}
   */
  getToolActionIdentifier(handle) {
    if (handle === null) {
      return 'move';
    }

    switch (handle.name) {
      case 'height':
      case 'width':
      case 'depth':
        return 'scale';
      default:
        return 'move';
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
      case 'height':
        return 'ns-resize';
      case 'width':
      case 'depth':
        return 'all-scroll';
      case 'move':
        return 'grab';
      default:
        return 'pointer';
    }
  }

  /**
   * @param {Point} point
   */
  moveTo(point) {
    const newPrimaryCornerVertex = this._projection3d.projectBottomCoordinateTo3d(new Vector3(point.x, point.y, 1));
    const oldPrimaryCornerVertex = this._cuboid3d.vertices[this._cuboidInteractionResolver.getPrimaryCornerIndex()];
    let movementVector;

    if (point.y > 0 && newPrimaryCornerVertex.x < 0) {
      // Shape moved above horizon
      // @TOOD: Move to maximal position here somehow :)
    }

    movementVector = newPrimaryCornerVertex.sub(oldPrimaryCornerVertex);

    this._cuboid3d.moveBy(movementVector);

    this._drawCuboid();
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {{height: number, width: number, length: number}} minDistance
   */
  resize(handle, point, minDistance = {height: 1, width: 1, length: 1}) { // eslint-disable-line no-unused-vars
    const handleVertexIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(handle.name);
    const interaction = this._cuboidInteractionResolver.resolveInteractionForVertex(handleVertexIndex);

    if (interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS]) {
      this._cuboid3d.manifestPredictionVertices();
      this._changeRotation(point, this._cuboid3d.vertices[handleVertexIndex]);
    }
    if (interaction[CuboidInteractionResolver.HEIGHT]) {
      this._changeHeight(point, this._cuboid3d.vertices[handleVertexIndex]);
    }
    if (interaction[CuboidInteractionResolver.DEPTH]) {
      this._changeHorizontal(point, this._cuboid3d.vertices[handleVertexIndex], CuboidInteractionResolver.DEPTH);
    }
    if (interaction[CuboidInteractionResolver.WIDTH]) {
      this._changeHorizontal(point, this._cuboid3d.vertices[handleVertexIndex], CuboidInteractionResolver.WIDTH);
    }

    this._drawCuboid();
  }

  /**
   * @param {Point} point
   * @param {Vector4} handleVertex
   * @private
   */
  _changeHeight(point, handleVertex) {
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const affectedVertices = this._cuboidInteractionResolver.resolveAffectedVerticesForInteraction(CuboidInteractionResolver.HEIGHT);
    const newReferencePoint = this._projection3d.projectTopCoordinateTo3d(
      new Vector3(point.x, point.y, 1),
      this._cuboid3d.vertices[primaryCornerIndex]
    );

    // Height may never be negative
    // Minimal height of a Cuboid is set to 5cm
    if (newReferencePoint.z < 0.05) {
      newReferencePoint.z = 0.05;
    }

    const distanceVector = newReferencePoint.sub(handleVertex);
    this._cuboid3d.addVectorToVertices(
      distanceVector,
      affectedVertices
    );
  }

  /**
   * @param {Point} point
   * @param {Vector4} handleVertex
   * @param {string} direction
   * @private
   */
  _changeHorizontal(point, handleVertex, direction) {
    const affectedVertices = this._cuboidInteractionResolver.resolveAffectedVerticesForInteraction(direction);
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const primaryCorner = this._cuboid3d.vertices[primaryCornerIndex];
    const mousePoint = this._projection3d.projectBottomCoordinateTo3d(point);

    const distancePrimaryToMouse = primaryCorner.clone().sub(mousePoint).length();
    const distancePrimaryToHandle = primaryCorner.clone().sub(handleVertex).length();
    const scaleAmount = distancePrimaryToMouse - distancePrimaryToHandle;
    const scaleDirection = handleVertex.sub(primaryCorner).normalize();
    const changeVector = scaleDirection.multiplyScalar(scaleAmount);

    this._cuboid3d.addVectorToVertices(
      changeVector,
      affectedVertices
    );
  }

  /**
   * Reduce the underlying Shapes to a Pseudo3d representation if this is possible/applicable
   *
   * Reduction is always possible if all, but one face of the cuboid are blocked by its projection
   */
  reduceToPseudo3dIfPossible() {
    const cuboid2d = this._projection2d.projectCuboidTo2d(this._cuboid3d);
    const vertexVisibilityCount = cuboid2d.vertexVisibility.reduce(
      (current, visible) => visible ? current + 1 : current
    );

    if (vertexVisibilityCount !== 4) {
      return;
    }

    // @TODO: Inject logger and replace this call with a proper one
    // console.log('Reducing PaperCuboid to Pseudo3d Cuboid: ', cuboid2d.vertexVisibility);

    this._cuboid3d.setVertices(
      this._cuboid3d.vertices.map(
        (vertex, index) => cuboid2d.vertexVisibility[index] ? vertex : null
      )
    );

    this._drawCuboid();
  }

  /**
   * @param {Point} point
   * @param {Vector4} handleVertex
   * @private
   */
  _changeRotation(point, handleVertex) {
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const primaryCorner = this._cuboid3d.vertices[primaryCornerIndex];
    const mousePoint = this._projection3d.projectBottomCoordinateTo3d(point);

    const vectorPrimaryToHandle = primaryCorner.clone().sub(handleVertex).normalize();
    const vectorPrimaryToMouse = primaryCorner.clone().sub(mousePoint).normalize();

    let radians = Math.acos(vectorPrimaryToHandle.clone().dot(vectorPrimaryToMouse));
    const crossProduct = new Vector3(
      vectorPrimaryToHandle.x,
      vectorPrimaryToHandle.y,
      vectorPrimaryToHandle.z
    ).cross(new Vector3(
      vectorPrimaryToMouse.x,
      vectorPrimaryToMouse.y,
      vectorPrimaryToMouse.z)
    );

    if (new Vector3(0, 0, 1).dot(crossProduct) < 0) {
      radians = -radians;
    }

    this._cuboid3d.rotateAroundZAtPointBy(primaryCorner, radians);
    this._drawCuboid();
  }

  /**
   * @param {Number} radians
   */
  rotateAroundCenter(radians) {
    this._cuboid3d.manifestPredictionVertices();
    this._cuboid3d.rotateAroundZAtPointBy(this._cuboid3d.bottomCenter, radians);
    this.reduceToPseudo3dIfPossible();
    this._drawCuboid();
  }

  /**
   * @returns {Point}
   */
  get position() {
    return this._projection2d.projectCuboidTo2d(this._cuboid3d).vertices[this._cuboidInteractionResolver.getPrimaryCornerIndex()];
  }

  /**
   * Convert to JSON for Storage
   */
  toJSON() {
    return {
      type: 'cuboid3d',
      id: this._shapeId,
      vehicleCoordinates: this._cuboid3d.nonPredictedVertices.map(
        vertex => vertex === null ? null : [vertex.x, vertex.y, vertex.z]
      ),
      labeledThingInFrameId: this.labeledThingInFrame.id,
    };
  }
}

/**
 * @returns {string}
 */
PaperCuboid.getClass = () => {
  return 'cuboid';
};

export default PaperCuboid;
