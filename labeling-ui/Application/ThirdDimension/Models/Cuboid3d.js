import {Vector4, Matrix4} from 'three-math';

class Cuboid3d {
  constructor(vertices) {
    this._vertices = vertices;
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
   * @param {number} radians
   */
  rotateZAroundCenterBy(radians) {
    // Create translation and rotation matrices
    const translation = new Matrix4();
    const inverseTranslation = new Matrix4();
    const rotation = new Matrix4();

    // Create translation vectors
    const translationVector = this.bottomCenter.negate();
    const inverseTranslationVector = this.bottomCenter;

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
    );
  }

  get isPseudo3d() {
    const availableVertices = this._vertices.reduce(
      (current, vertex) => vertex !== null ? current + 1 : current,
      0
    );

    return availableVertices === 4;
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
