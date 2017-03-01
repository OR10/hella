import paper from 'paper';
import {Vector3} from 'three-math';
import PaperShape from '../../Viewer/Shapes/PaperShape';
import PaperThingShape from '../../Viewer/Shapes/PaperThingShape';
import RectangleHandle from '../../Viewer/Shapes/Handles/Rectangle';

import Cuboid3d from '../Models/Cuboid3d';
import CuboidInteractionResolver from '../Support/CuboidInteractionResolver';
import ManualUpdateCuboidInteractionResolver from '../Support/ManualUpdateCuboidInteractionResolver';

class PaperCuboid extends PaperThingShape {
  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String} shapeId
   * @param {Projection2d} projection2d
   * @param {Projection3d} projection3d
   * @param {Array} cuboid3dPoints
   * @param {{primary: string, secondary: string}} color
   * @param {boolean?} draft
   */
  constructor(labeledThingInFrame, shapeId, projection2d, projection3d, cuboid3dPoints, color, draft) {
    super(labeledThingInFrame, shapeId, color, draft);

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
    const leftVector = this._projectedCuboid.vertices.reduce((initial, current) => initial.x < current.x ? initial : current);
    const rightVector = this._projectedCuboid.vertices.reduce((initial, current) => initial.x > current.x ? initial : current);
    const topVector = this._projectedCuboid.vertices.reduce((initial, current) => initial.y < current.y ? initial : current);
    const bottomVector = this._projectedCuboid.vertices.reduce((initial, current) => initial.y > current.y ? initial : current);

    const topLeft = new paper.Point(leftVector.x, topVector.y);
    const bottomRight = new paper.Point(rightVector.x, bottomVector.y);

    return {
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
      x: topLeft.x,
      y: topLeft.y,
      point: topLeft,
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
   * @param {Number} minimalHeight
   */
  moveTo(point, minimalHeight) {
    const targetPrimaryVertex2d = new Vector3(point.x, point.y, 1);
    // const sourcePrimaryVertex2d = this._projectedCuboid.vertices[this._cuboidInteractionResolver.getPrimaryCornerIndex()];

    const newPrimaryCornerVertex = this._projection3d.projectBottomCoordinateTo3d(targetPrimaryVertex2d);
    const oldPrimaryCornerVertex = this._cuboid3d.vertices[this._cuboidInteractionResolver.getPrimaryCornerIndex()];

    if (point.y > 0 && newPrimaryCornerVertex.x < 0) {
      // Movement above the horizon
      // For now just stop this movement from happening.
      // @TODO: "Snap" into a sensible size restriction here once we figured out how to calculate that
      return;
    }

    const movementVector = newPrimaryCornerVertex.sub(oldPrimaryCornerVertex);

    const mouseTargetCuboid3d = this._cuboid3d.clone().moveBy(movementVector);
    const mouseTargetCuboid2d = this._projection2d.projectCuboidTo2d(mouseTargetCuboid3d);

    // Limit to minimalHeight
    const heightHandleVertexIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(CuboidInteractionResolver.HEIGHT);
    // const sourceHeightHandleVertex2d = this._projectedCuboid.vertices[heightHandleVertexIndex];
    const targetHeightHandleVertex2d = mouseTargetCuboid2d.vertices[heightHandleVertexIndex];

    if (targetPrimaryVertex2d.distanceTo(targetHeightHandleVertex2d) < minimalHeight) {
      return;
    }
    this._cuboid3d.moveBy(movementVector);
    this._drawCuboid();

    /*
     // Snap point calculation (does not fully work)

     // Smaller then minimal height
     const primarySlope = (targetPrimaryVertex2d.y - sourcePrimaryVertex2d.y) / (targetPrimaryVertex2d.x - sourcePrimaryVertex2d.x);
     const heightSlope = (targetHeightHandleVertex2d.y - sourceHeightHandleVertex2d.y) / (targetHeightHandleVertex2d.x - sourceHeightHandleVertex2d.x);

     const primaryIntercept = sourcePrimaryVertex2d.y - primarySlope * sourcePrimaryVertex2d.x;
     const heightIntercept = sourceHeightHandleVertex2d.y - heightSlope * sourceHeightHandleVertex2d.x;

     const snapX = (minimalHeight - primaryIntercept + heightIntercept) / (primarySlope - heightSlope);
     const snapY = primarySlope * snapX + primaryIntercept;

     const snappedPrimaryCornerVertex2d = new Vector3(snapX, snapY, 1);
     const snappedPrimaryCornerVertex3d = this._projection3d.projectBottomCoordinateTo3d(snappedPrimaryCornerVertex2d);

     const limitedMovementVector = snappedPrimaryCornerVertex3d.clone().sub(oldPrimaryCornerVertex);

     this._cuboid3d.moveBy(limitedMovementVector);
     this._drawCuboid(); */
  }

  /**
   * @param {Handle} handle
   * @param {Point} point
   * @param {number} minimalHeight
   */
  resize(handle, point, minimalHeight) {
    const handleVertexIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(handle.name);
    const interaction = this._cuboidInteractionResolver.resolveInteractionForVertex(handleVertexIndex);

    if (interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS]) {
      this._cuboid3d.manifestPredictionVertices();
      this._changeRotation(point, this._cuboid3d.vertices[handleVertexIndex]);
    }
    if (interaction[CuboidInteractionResolver.HEIGHT]) {
      this._changeHeight(point, handleVertexIndex, minimalHeight);
    }
    if (interaction[CuboidInteractionResolver.DEPTH]) {
      this._changeHorizontal(point, handleVertexIndex, CuboidInteractionResolver.DEPTH);
    }
    if (interaction[CuboidInteractionResolver.WIDTH]) {
      this._changeHorizontal(point, handleVertexIndex, CuboidInteractionResolver.WIDTH);
    }

    this._drawCuboid();
  }

  /**
   * Resize the cuboid given a specific handle name (height, depth, width) and a distance value
   *
   * The distance may be negative to express a reduction of the given value.
   *
   * @param {string} handleName
   * @param {int} distance
   * @param {int} minimalHeight
   */
  resizeByDistance(handleName, distance, minimalHeight) {
    const allowedHandleNames = [
      CuboidInteractionResolver.DEPTH,
      CuboidInteractionResolver.HEIGHT,
      CuboidInteractionResolver.WIDTH,
    ];

    if (!allowedHandleNames.includes(handleName)) {
      throw new Error(`The given handleName (${handleName}) is not allowed for a resizeByDistance operation.`);
    }

    const handleVertexIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(handleName);
    const interaction = this._cuboidInteractionResolver.resolveInteractionForVertex(handleVertexIndex);

    const cuboid2d = this._projection2d.projectCuboidTo2d(this._cuboid3d);
    const primaryVertex2d = cuboid2d.vertices[this._cuboidInteractionResolver.getPrimaryCornerIndex()];
    const handleVertex2d = cuboid2d.vertices[handleVertexIndex];

    const primaryVertexToHandleVertexVector2d = handleVertex2d.clone().sub(primaryVertex2d);

    const targetVector = handleVertex2d.clone().add(
      primaryVertexToHandleVertexVector2d.clone().normalize().multiplyScalar(distance)
    );

    // Depending on whether we are shortening or enlarging the cube and the position of the handle relative to the
    // primary vertex, we need to round differently, to ensure we always have a value change, even for small values.
    let roundingOperationForX = null;
    let roundingOperationForY = null;

    const handleLeftOfPrimary = handleVertex2d.x < primaryVertex2d.x;
    const handleRightOfPrimary = handleVertex2d.x >= primaryVertex2d.x;
    const handleAbovePrimary = handleVertex2d.y < primaryVertex2d.y;
    const handleBelowPrimary = handleVertex2d.y >= primaryVertex2d.y;
    const positiveDistance = distance >= 0;
    const negativeDistance = distance < 0;

    if (positiveDistance) {
      if (handleLeftOfPrimary) {
        roundingOperationForX = 'floor';
      } else if (handleRightOfPrimary) {
        roundingOperationForX = 'ceil';
      }

      if (handleAbovePrimary) {
        roundingOperationForY = 'floor';
      } else if (handleBelowPrimary) {
        roundingOperationForY = 'ceil';
      }
    } else if (negativeDistance) {
      if (handleLeftOfPrimary) {
        roundingOperationForX = 'ceil';
      } else if (handleRightOfPrimary) {
        roundingOperationForX = 'floor';
      }

      if (handleAbovePrimary) {
        roundingOperationForY = 'ceil';
      } else if (handleBelowPrimary) {
        roundingOperationForY = 'floor';
      }
    }

    const targetPoint = new paper.Point(
      Math[roundingOperationForX](targetVector.x),
      Math[roundingOperationForY](targetVector.y)
    );

    if (interaction[CuboidInteractionResolver.HEIGHT]) {
      this._changeHeight(targetPoint, handleVertexIndex, minimalHeight);
    }
    if (interaction[CuboidInteractionResolver.DEPTH]) {
      this._changeHorizontal(targetPoint, handleVertexIndex, CuboidInteractionResolver.DEPTH);
    }
    if (interaction[CuboidInteractionResolver.WIDTH]) {
      this._changeHorizontal(targetPoint, handleVertexIndex, CuboidInteractionResolver.WIDTH);
    }

    this._drawCuboid();
  }

  rotateFaces(clockwise = true) {
    const faceMapping = this._getFaceRotationMapping(clockwise);
    const vertices = this._cuboid3d.vertices;
    this._cuboid3d.setVertices([
      vertices[faceMapping[0]],
      vertices[faceMapping[1]],
      vertices[faceMapping[2]],
      vertices[faceMapping[3]],
      vertices[faceMapping[4]],
      vertices[faceMapping[5]],
      vertices[faceMapping[6]],
      vertices[faceMapping[7]],
    ]);

    this.updatePrimaryCorner();
    this.reduceToPseudo3dIfPossible();
    this._drawCuboid(true);
  }

  _getFaceRotationMapping(clockwise) {
    let faceMapping = {
      4: 0,
      0: 1,
      3: 2,
      7: 3,
      1: 5,
      2: 6,
      5: 4,
      6: 7,
    };

    if (clockwise === true) {
      const newFaceMapping = {};
      for (const source in faceMapping) {
        if (faceMapping.hasOwnProperty(source)) {
          newFaceMapping[faceMapping[source]] = source;
        }
      }
      faceMapping = newFaceMapping;
    }

    return faceMapping;
  }

  /**
   * @param {Point} point
   * @param {number} handleVertexIndex
   * @param {number} minimalHeight
   * @private
   */
  _changeHeight(point, handleVertexIndex, minimalHeight) {
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const primaryCornerVertex = this._cuboid3d.vertices[primaryCornerIndex];

    const handleVertex = this._cuboid3d.vertices[handleVertexIndex];
    const affectedVertices = this._cuboidInteractionResolver.resolveAffectedVerticesForInteraction(CuboidInteractionResolver.HEIGHT);
    const newReferencePoint = this._projection3d.projectTopCoordinateTo3d(
      new Vector3(point.x, point.y, 1),
      primaryCornerVertex
    );

    let distanceVector = newReferencePoint.clone().sub(handleVertex);

    const heightCheckCuboid3d = this._cuboid3d.clone();
    heightCheckCuboid3d.addVectorToVertices(
      distanceVector,
      affectedVertices
    );

    // Minimal height not reached snap to minimal height cuboid
    if (!this._hasMinimalHeight(heightCheckCuboid3d, minimalHeight)) {
      const cuboid2d = this._projection2d.projectCuboidTo2d(this._cuboid3d);
      const primaryCornerVertex2d = cuboid2d.vertices[primaryCornerIndex];
      const heightHandleVertex2d = cuboid2d.vertices[handleVertexIndex];

      const directionVector = heightHandleVertex2d.sub(primaryCornerVertex2d);
      directionVector.normalize().multiplyScalar(minimalHeight);
      const minimalHeight2dVertex = primaryCornerVertex2d.clone().add(directionVector);
      const minimalHeightReferencePoint = this._projection3d.projectTopCoordinateTo3d(
        new Vector3(minimalHeight2dVertex.x, minimalHeight2dVertex.y, 1),
        primaryCornerVertex
      );

      distanceVector = minimalHeightReferencePoint.clone().sub(handleVertex);
    }

    this._cuboid3d.addVectorToVertices(
      distanceVector,
      affectedVertices
    );
  }

  /**
   * Check whether the given cuboid has the specified minimal height in 2d space
   *
   * @param {Cuboid3d} cuboid3d
   * @param {number} minimalHeight
   * @returns {boolean}
   * @private
   */
  _hasMinimalHeight(cuboid3d, minimalHeight) {
    const cuboid2d = this._projection2d.projectCuboidTo2d(cuboid3d.clone());
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const handleVertexIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(CuboidInteractionResolver.HEIGHT);

    const primaryCornerVertex2d = cuboid2d.vertices[primaryCornerIndex];
    const handleVertex2d = cuboid2d.vertices[handleVertexIndex];

    let distance = primaryCornerVertex2d.distanceTo(handleVertex2d);

    // Do not allow negative height
    if (handleVertex2d.y > primaryCornerVertex2d.y) {
      distance = distance * -1;
    }

    return (distance > minimalHeight);
  }

  /**
   * @param {Point} point
   * @param {Number} handleVertexIndex
   * @param {string} direction
   * @private
   */
  _changeHorizontal(point, handleVertexIndex, direction) {
    const affectedVertices = this._cuboidInteractionResolver.resolveAffectedVerticesForInteraction(direction);
    const handleVertex = this._cuboid3d.vertices[handleVertexIndex];
    const primaryCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const primaryVertex = this._cuboid3d.vertices[primaryCornerIndex];

    const handle2d = this._projectedCuboid.vertices[handleVertexIndex];
    const primary2d = this._projectedCuboid.vertices[primaryCornerIndex];
    const slope = (handle2d.y - primary2d.y) / (handle2d.x - primary2d.x);

    const relativeMousePoint = new Vector3(point.x - primary2d.x, primary2d.y - point.y, 1);
    let relativeLinePoint;
    if (Math.abs(slope) > 1) {
      relativeLinePoint = new Vector3(relativeMousePoint.y / (-1 * slope), relativeMousePoint.y, 1);
    } else {
      relativeLinePoint = new Vector3(relativeMousePoint.x, relativeMousePoint.x * (-1) * slope, 1);
    }
    const linePoint = new Vector3(relativeLinePoint.x + primary2d.x, primary2d.y - relativeLinePoint.y);
    const targetPoint = this._projection3d.projectBottomCoordinateTo3d(linePoint);
    const changeVector = targetPoint.clone().sub(handleVertex);

    // Prevent bottom coordinates to go past the horizon
    if (targetPoint.x < 0) {
      return;
    }

    // Prevent handle to be dragged over the primary corner (mirroring of the cuboid)
    if (direction === CuboidInteractionResolver.WIDTH) {
      const before = primary2d.x - handle2d.x;
      const after = primary2d.x - linePoint.x;
      if (((before > 0 && after < 0) || (after > 0 && before < 0)) || primaryVertex.sub(targetPoint).length() < 0.05) {
        // TODO: clamp to maximal limit value
        // changeVector.normalize().multiplyScalar(primaryVertex.clone().sub(handleVertex).length() - 0.3);
        return;
      }
    } else {
      const before = primary2d.y - handle2d.y;
      const after = primary2d.y - linePoint.y;
      if (((before > 0 && after < 0) || (after > 0 && before < 0)) || primaryVertex.sub(targetPoint).length() < 0.05) {
        // TODO: clamp to maximal limit value
        // changeVector.normalize().multiplyScalar(primaryVertex.clone().sub(handleVertex).length() - 0.3);
        return;
      }
    }

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

  get dimensions() {
    const bottomCornerIndex = this._cuboidInteractionResolver.getPrimaryCornerIndex();
    const topCornerIndex = this._cuboidInteractionResolver.getVertexIndexFromHandleName(CuboidInteractionResolver.HEIGHT);
    const height2d = this._projectedCuboid.vertices[bottomCornerIndex].y - this._projectedCuboid.vertices[topCornerIndex].y;
    const height3d = this._cuboid3d.vertices[topCornerIndex].z;

    return {height2d, height3d};
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
