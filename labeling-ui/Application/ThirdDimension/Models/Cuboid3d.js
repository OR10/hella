import {Vector3, Vector4, Matrix4} from 'three-math';
import CuboidDimensionPrediction from './DimensionPrediction/Cuboid';
import {isEqual} from 'lodash';

class Cuboid3d {
  /**
   * @param {Array.<Vector4>} vertices
   */
  constructor(vertices) {
    /**
     * @type {Array.<Vector4>}
     * @private
     */
    this._vertices = undefined;

    /**
     * List of vertices, which are predictions and not real values
     *
     * @type {Array.<boolean>}
     * @private
     */
    this._predictedVertices = [false, false, false, false, false, false, false, false];

    /**
     * Latest prediction of dimensions for this cuboid
     *
     * @type {CuboidDimensionPrediction|null}
     * @private
     */
    this._dimensionPrediction = null;

    this.setVertices(vertices);
  }

  /**
   * Clone this {@link Cuboid3d}
   *
   * @returns {Cuboid3d}
   */
  clone() {
    return new Cuboid3d(this.vertices);
  }

  /**
   * Update the vertices in this cuboid representation
   *
   * The input array may contain `null` values to represent pseudo3d information.
   *
   * @param {Array.<Vector4|null>} vertices
   */
  setVertices(vertices) {
    // Update predicted value list
    this._predictedVertices = vertices.map(vertex => vertex === null);

    // Weave in prediction values
    if (this._getPredictedVerticesCount(this._predictedVertices) > 0) {
      this._vertices = this._predictMissingVertices(vertices);
    } else {
      this._vertices = vertices;
    }

    return this;
  }

  /**
   * Manifest the currently predicted vertices into the data structure
   */
  manifestPredictionVertices() {
    this._predictedVertices = [false, false, false, false, false, false, false, false];
  }


  /**
   * @param {Vector4} vector
   * @return {Cuboid3d}
   */
  moveBy(vector) {
    this._vertices.forEach(
      vertex => vertex.add(vector)
    );

    return this;
  }

  /**
   * @param {Vector4} baseVertex
   * @param {Number} radians
   */
  rotateAroundZAtPointBy(baseVertex, radians) {
    // Create translation and rotation matrices
    const translation = new Matrix4();
    const inverseTranslation = new Matrix4();
    const rotation = new Matrix4();

    // Create translation vectors
    const translationVector = baseVertex.clone().negate();
    const inverseTranslationVector = baseVertex;

    // Calculate translation and rotation
    translation.makeTranslation(translationVector.x, translationVector.y, translationVector.z);
    inverseTranslation.makeTranslation(inverseTranslationVector.x, inverseTranslationVector.y, inverseTranslationVector.z);
    rotation.makeRotationZ(radians);

    this._vertices.forEach(
      vertex => vertex.applyMatrix4(translation).applyMatrix4(rotation).applyMatrix4(inverseTranslation)
    );
  }

  /**
   * @param {Vector3} vector
   * @param {Array.<Number>} vertexIndices
   */
  addVectorToVertices(vector, vertexIndices) {
    vertexIndices.forEach(
      pointIndex => this._vertices[pointIndex].add(vector)
    );
  }

  /**
   * Make a pseudo 3d cuboid real 3d again using the most recent {@link CuboidDimensionPrediction}
   *
   * The input array may contain `null` values!
   *
   * @param {Array.<Vector4|null>} vertices
   * @private
   */
  _predictMissingVertices(vertices) {
    const dimensionPrediction = this.mostRecentDimensionPrediction;
    const {multiplier, prediction, sourceFace, targetFace} = this._getExtrusionParameters(vertices);

    const extrusionVector = new Vector3();
    extrusionVector.crossVectors(
      vertices[sourceFace[0]].clone().sub(vertices[sourceFace[1]]),
      vertices[sourceFace[2]].clone().sub(vertices[sourceFace[1]])
    ).normalize();

    let predictionInterleaveVertices = vertices.map(vertex => vertex === null ? null : vertex.clone()); // eslint-disable-line prefer-const

    targetFace.forEach((targetIndex, faceIndex) => {
      const sourceIndex = sourceFace[faceIndex];
      const targetVector = vertices[sourceIndex].clone();
      targetVector.add(extrusionVector.clone().multiplyScalar(multiplier).multiplyScalar(dimensionPrediction[prediction]));

      if (predictionInterleaveVertices[targetIndex] !== null) {
        throw new Error(`Trying to predict non missing vertex: ${targetIndex}: ${predictionInterleaveVertices[targetIndex]}.`);
      }

      predictionInterleaveVertices[targetIndex] = new Vector4(targetVector.x, targetVector.y, targetVector.z, 1);
    });

    return predictionInterleaveVertices;
  }

  /**
   * Provide the necessary extrusion parameters for extending a cube using predicted values
   *
   * The input array may contain `null` values!
   *
   * @param {Array.<Vector4|null>} vertices
   * @private
   */
  _getExtrusionParameters(vertices) {
    const pseudo3dIndices = vertices.map(
      (vertex, index) => vertex === null ? null : index
    ).filter(
      indexOrNull => indexOrNull !== null
    );

    const extrusion = {
      multiplier: 1,
      prediction: null,
      sourceFace: null,
      targetFace: null,
    };

    switch (true) {
      // Front face
      case isEqual(pseudo3dIndices, [0, 1, 2, 3]):
        extrusion.multiplier = -1;
        extrusion.prediction = 'depth';
        extrusion.sourceFace = [0, 1, 2, 3];
        extrusion.targetFace = [4, 5, 6, 7];
        break;
      // Back face
      case isEqual(pseudo3dIndices, [4, 5, 6, 7]):
        extrusion.prediction = 'depth';
        extrusion.sourceFace = [4, 5, 6, 7];
        extrusion.targetFace = [0, 1, 2, 3];
        break;
      // Right face
      case isEqual(pseudo3dIndices, [1, 2, 5, 6]):
        extrusion.multiplier = -1;
        extrusion.prediction = 'width';
        extrusion.sourceFace = [1, 5, 6, 2];
        extrusion.targetFace = [0, 4, 7, 3];
        break;
      // Left face
      case isEqual(pseudo3dIndices, [0, 3, 4, 7]):
        extrusion.prediction = 'width';
        extrusion.sourceFace = [0, 4, 7, 3];
        extrusion.targetFace = [1, 5, 6, 2];
        break;
      default:
        throw new Error(`Invalid pseudo 3d cuboid found (${pseudo3dIndices}). Can't make 3d again`);
    }

    return extrusion;
  }

  /**
   * @param {Number} bottomIndex
   * @returns {Number}
   */
  getTopCoordinateIndex(bottomIndex) {
    switch (bottomIndex) {
      case 2:
        return 1;
      case 3:
        return 0;
      case 6:
        return 5;
      case 7:
        return 4;
      default:
    }
  }

  get vertices() {
    return this._vertices.map(vertex => vertex.clone());
  }

  /**
   * Retrieve only non predicted vertices, null otherwise
   *
   * @returns {Array.<Vector4|null>}
   */
  get nonPredictedVertices() {
    return this._vertices.map(
      (vertex, index) => this._predictedVertices[index] ? null : vertex.clone()
    );
  }

  get bottomCenter() {
    return this._vertices[2]
      .clone()
      .add(this._vertices[7])
      .divideScalar(2);
  }

  _getPredictedVerticesCount(predictedVertices) {
    const predictedVerticesCount = predictedVertices.reduce(
      (current, predicted) => predicted ? current + 1 : current,
      0
    );

    return predictedVerticesCount;
  }

  get isPseudo3d() {
    return this._getPredictedVerticesCount(this._predictedVertices) === 4;
  }

  get mostRecentDimensionPrediction() {
    if (this._dimensionPrediction === null) {
      return new CuboidDimensionPrediction({
        width: 1,
        height: 1,
        depth: 1,
      });
    }

    return this._dimensionPrediction;
  }

  updateDimensionPrediction(dimensionPrediction) {
    this._dimensionPrediction = dimensionPrediction;
  }
}

/**
 * @param {Array.<Array.<Number>>} vertices
 * @returns {Cuboid3d}
 */
Cuboid3d.createFromRawVertices = vertices => {
  return new Cuboid3d(vertices.map(
    vertex => vertex === null ? null : new Vector4(vertex[0], vertex[1], vertex[2], 1)
  ));
};

export default Cuboid3d;
