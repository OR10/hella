import {Vector4, Matrix4} from 'three-math';
import CuboidDimensionPrediction from './DimensionPrediction/Cuboid';

class Cuboid3d {
  constructor(vertices) {
    this._vertices = vertices;
  }

 /**
   * Clone this {@link Cuboid3d}
   *
   * @returns {Cuboid3d}
   */
  clone() {
    return new Cuboid3d(this._vertices);
  }

  /**
   * @param {Array.<Vector4>} vectors
   */
  setVertices(vectors) {
    this._vertices = vectors.map(vector => [vector.x, vector.y, vector.z]);
  }

  /**
   * @returns {{vertices, names, cornerIndex}}
   */
  getPrimaryVertices() {
    return this._getPrimaryVertices(this);
  }

  /**
   * @param {Vector4} vector
   */
  moveBy(vector) {
    this._vertices = this._vertices.map(vertex => {
      return [
        vertex[0] + vector.x,
        vertex[1] + vector.y,
        vertex[2] + vector.z,
      ];
    });
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

    this.setVertices(this.vertices.map(
      // Apply translation and rotation
      vertex => vertex === null ? null
        : vertex.applyMatrix4(translation).applyMatrix4(rotation).applyMatrix4(inverseTranslation)
    ));
  }

  /**
   * @param {Vector3} vector
   * @param {Array.<Number>} vertexIndices
   */
  addVectorToVertices(vector, vertexIndices) {
    vertexIndices.map(pointIndex => {
      this._vertices[pointIndex] = [
        this._vertices[pointIndex][0] + vector.x,
        this._vertices[pointIndex][1] + vector.y,
        this._vertices[pointIndex][2] + vector.z,
      ];
    });
  }

  /**
   * Make a pseudo 3d cuboid real 3d again using the most recent {@link CuboidDimensionPrediction}
   */
  makeReal3d() {
    if (!this.isPseudo3d) {
      // Nothing to be done here
      return;
    }

    const dimensionPrediction = this.mostRecentDimensionPrediction;
    const {multiplier, prediction, sourceFace, targetFace} = this._extrusionParameters;

    const extrusionVector = new Vector4();
    extrusionVector.crossVectors(
      this.vertices[sourceFace[0]].clone().sub(this.vertices[sourceFace[1]]),
      this.vertices[sourceFace[2]].clone().sub(this.vertices[sourceFace[1]])
    ).normalize();

    targetFace.forEach((targetIndex, faceIndex) => {
      const sourceIndex = sourceFace[faceIndex];
      const targetVector = this.vertices[sourceIndex].clone();
      targetVector.add(extrusionVector.clone().multiplyScalar(multiplier).multiplyScalar(dimensionPrediction[prediction]));
      this._vertices[targetIndex] = [targetVector.x, targetVector.y, targetVector.z];
    });
  }

  get _extrusionParameters() {
    const pseudo3dIndices = this._vertices.map(
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
      case pseudo3dIndices == [0, 1, 2, 3]: // eslint-disable-line eqeqeq
        extrusion.prediction = 'depth';
        extrusion.sourceFace = [0, 1, 2, 3];
        extrusion.targetFace = [4, 5, 6, 7];
        break;
      // Back face
      case pseudo3dIndices == [4, 5, 6, 7]: // eslint-disable-line eqeqeq
        extrusion.multiplier = -1;
        extrusion.prediction = 'depth';
        extrusion.sourceFace = [4, 5, 6, 7];
        extrusion.targetFace = [0, 1, 2, 3];
        break;
      // Right face
      case pseudo3dIndices == [1, 2, 5, 6]: // eslint-disable-line eqeqeq
        extrusion.prediction = 'width';
        extrusion.sourceFace = [1, 5, 6, 2];
        extrusion.targetFace = [0, 4, 7, 3];
        break;
      // Left face
      case pseudo3dIndices == [0, 3, 4, 7]: // eslint-disable-line eqeqeq
        extrusion.multiplier = -1;
        extrusion.prediction = 'width';
        extrusion.sourceFace = [0, 4, 7, 3];
        extrusion.targetFace = [1, 5, 6, 2];
        break;
      default:
        throw new Error('Invalid pseudo 3d cuboid found. Can\'t make 3d again');
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
    return this._vertices.map(vertex => new Vector4(...vertex, 1));
  }

  get frontTopLeft() {
    return new Vector4(...this._vertices[0], 1);
  }

  get frontTopRight() {
    return new Vector4(...this._vertices[1], 1);
  }

  get frontBottomRight() {
    return new Vector4(...this._vertices[2], 1);
  }

  get frontBottomLeft() {
    return new Vector4(...this._vertices[3], 1);
  }

  get backTopLeft() {
    return new Vector4(...this._vertices[4], 1);
  }

  get backTopRight() {
    return new Vector4(...this._vertices[5], 1);
  }

  get backBottomRight() {
    return new Vector4(...this._vertices[6], 1);
  }

  get backBottomLeft() {
    return new Vector4(...this._vertices[7], 1);
  }

  get bottomCenter() {
    return new Vector4(
      (this._vertices[2][0] + this._vertices[7][0]) / 2,
      (this._vertices[2][1] + this._vertices[7][1]) / 2,
      (this._vertices[2][2] + this._vertices[7][2]) / 2,
      1
    );
  }

  get isPseudo3d() {
    const availableVertices = this._vertices.reduce(
      (current, vertex) => vertex !== null ? current + 1 : current,
      0
    );

    return availableVertices === 4;
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
 * @param {Array.<THREE.Vector4>} vertices
 * @returns {Cuboid3d}
 */
Cuboid3d.createFromVectors = (vertices) => {
  return new Cuboid3d(vertices.map(vertex => [vertex.x, vertex.y, vertex.z]));
};

export default Cuboid3d;
