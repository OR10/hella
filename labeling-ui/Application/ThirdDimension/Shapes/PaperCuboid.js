import paper from 'paper';
import {Vector3, Vector4} from 'three-math';
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
   * @param {{primary, secondary}} color
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
     * @type {boolean}
     * @private
     */
    this._drawHandles = true;

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
   * @private
   */
  _drawCuboid() {
    this._projectedCuboid = this._projection2d.projectCuboidTo2d(this._cuboid3d);

    this.removeChildren();

    const planes = this._createPlanes();
    this.addChildren(planes);

    const lines = this._createEdges();
    this.addChildren(lines);

    const directionSymbols = this._createDirectionSymbols();
    this.addChildren(directionSymbols);

    if (this._isSelected && this._drawHandles) {
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
   * @returns {Array.<Line>}
   * @private
   */
  _createDirectionSymbols() {
    const planes = [
      [0, 1, 2, 3],
      [1, 5, 6, 2],
      [4, 0, 3, 7],
      [4, 5, 6, 7],
    ];

    const visiblePlanes = planes.filter(
      plane => plane.filter(
        vertexIndex => this._projectedCuboid.vertexVisibility[vertexIndex]
      ).length === 4
    );

    const shapes = [];
    visiblePlanes.forEach(plane => {
      shapes.push(new paper.Path.Line({
        segments: this._calculateShapePointsForPlane(plane),
        fillColor: this._color.primary,
        selected: false,
        strokeScaling: false,
        closed: true,
      }));
    });

    return shapes;
  }

  /**
   * @param {Array.<Number>} plane
   * @returns {Array.<Point>}
   * @private
   */
  _calculateShapePointsForPlane(plane) {
    switch (plane.join('')) {
      case '1562':
        return this._createArrow(1, 5, 6, 2);
      case '4037':
        return this._createArrow(0, 4, 7, 3);
      case '0123':
        return this._createDot(0, 1, 2, 3);
      case '4567':
        return this._createCross(4, 5, 6, 7);
      default:
    }
  }

  /**
   * @param {Number} topLeftIndex
   * @param {Number} topRightIndex
   * @param {Number} bottomRightIndex
   * @param {Number} bottomLeftIndex
   * @returns {Array.<Point>}
   * @private
   */
  _createArrow(topLeftIndex, topRightIndex, bottomRightIndex, bottomLeftIndex) {
    const topLeft = this._projectedCuboid.vertices[topLeftIndex];
    const topRight = this._projectedCuboid.vertices[topRightIndex];
    const bottomRight = this._projectedCuboid.vertices[bottomRightIndex];
    const bottomLeft = this._projectedCuboid.vertices[bottomLeftIndex];

    const cubeLength = topLeft.distanceTo(topRight);
    const cubeHeight = topLeft.distanceTo(bottomLeft);

    const rightCenter = topRight.clone().add(bottomRight).divideScalar(2);
    const leftCenter = topLeft.clone().add(bottomLeft).divideScalar(2);

    const horizontalDirection = leftCenter.clone().sub(rightCenter).normalize();
    const verticalDirection = topLeft.clone().sub(bottomLeft).normalize();
    const negativeVerticalDirection = bottomLeft.clone().sub(topLeft).normalize();


    const point1 = rightCenter.clone().add(horizontalDirection.clone().multiplyScalar(0.1 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.05 * cubeHeight));
    const point2 = point1.clone().add(horizontalDirection.clone().multiplyScalar(0.6 * cubeLength));
    const point3 = point2.clone().add(verticalDirection.clone().multiplyScalar(0.1 * cubeHeight));
    const point4 = rightCenter.clone().add(horizontalDirection.clone().multiplyScalar(0.9 * cubeLength));
    const point7 = rightCenter.clone().add(horizontalDirection.clone().multiplyScalar(0.1 * cubeLength)).add(negativeVerticalDirection.clone().multiplyScalar(0.05 * cubeHeight));
    const point6 = point7.clone().add(horizontalDirection.clone().multiplyScalar(0.6 * cubeLength));
    const point5 = point6.clone().add(negativeVerticalDirection.clone().multiplyScalar(0.1 * cubeHeight));

    return [point1, point2, point3, point4, point5, point6, point7];
  }

  /**
   *
   * @param {Number} topLeftIndex
   * @param {Number} topRightIndex
   * @param {Number} bottomRightIndex
   * @param {Number} bottomLeftIndex
   * @returns {Array.<Point>}
   * @private
   */
  _createDot(topLeftIndex, topRightIndex, bottomRightIndex, bottomLeftIndex) {
    const topLeft = this._projectedCuboid.vertices[topLeftIndex];
    const topRight = this._projectedCuboid.vertices[topRightIndex];
    const bottomRight = this._projectedCuboid.vertices[bottomRightIndex];
    const bottomLeft = this._projectedCuboid.vertices[bottomLeftIndex];

    const topCenter = topLeft.clone().add(topRight).divideScalar(2);
    const rightCenter = topRight.clone().add(bottomRight).divideScalar(2);
    const bottomCenter = bottomLeft.clone().add(bottomRight).divideScalar(2);
    const leftCenter = bottomLeft.clone().add(topLeft).divideScalar(2);

    const horizontalDirection = leftCenter.clone().sub(rightCenter).normalize();
    const verticalDirection = topCenter.clone().sub(bottomCenter).normalize();

    const cubeLength = leftCenter.distanceTo(rightCenter);
    const cubeHeight = topCenter.distanceTo(bottomCenter);

    return [
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.45 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.45 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.55 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.45 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.55 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.55 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.45 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.55 * cubeHeight)),
    ];
  }

  /**
   * @param {Number} topLeftIndex
   * @param {Number} topRightIndex
   * @param {Number} bottomRightIndex
   * @param {Number} bottomLeftIndex
   * @returns {Array.<Point>}
   * @private
   */
  _createCross(topLeftIndex, topRightIndex, bottomRightIndex, bottomLeftIndex) {
    const topLeft = this._projectedCuboid.vertices[topLeftIndex];
    const topRight = this._projectedCuboid.vertices[topRightIndex];
    const bottomRight = this._projectedCuboid.vertices[bottomRightIndex];
    const bottomLeft = this._projectedCuboid.vertices[bottomLeftIndex];

    const topCenter = topLeft.clone().add(topRight).divideScalar(2);
    const rightCenter = topRight.clone().add(bottomRight).divideScalar(2);
    const bottomCenter = bottomLeft.clone().add(bottomRight).divideScalar(2);
    const leftCenter = bottomLeft.clone().add(topLeft).divideScalar(2);

    const horizontalDirection = leftCenter.clone().sub(rightCenter).normalize();
    const verticalDirection = topCenter.clone().sub(bottomCenter).normalize();

    const cubeLength = leftCenter.distanceTo(rightCenter);
    const cubeHeight = topCenter.distanceTo(bottomCenter);

    return [
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.5 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.4 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.3 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.2 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.2 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.3 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.4 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.5 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.2 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.7 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.3 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.8 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.5 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.6 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.7 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.8 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.8 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.7 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.6 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.5 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.8 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.3 * cubeHeight)),
      bottomRight.clone().add(horizontalDirection.clone().multiplyScalar(0.7 * cubeLength)).add(verticalDirection.clone().multiplyScalar(0.2 * cubeHeight)),
    ];
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
   * @param {Array.<Array.<Number>>} vertices
   */
  setVertices(vertices) {
    this._cuboid3d = Cuboid3d.createFromRawVertices(vertices);
    this._drawCuboid();
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
    this._drawHandles = drawHandles;
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
