import {Vector4} from 'three-math';

class Cuboid3d {
  constructor(vertices) {
    this._vertices = vertices;
  }

  /**
   * @returns {{vertices, names, edge}}
   */
  getPrimaryVertices() {
    return this._getPrimaryVertices(this);
  }

  /**
   * @param {Cuboid3d} cuboid3d
   *
   * @private
   * @returns {{vertices, names, edge}}
   */
  _getPrimaryVertices(cuboid3d) {
    const mapping = {
      2: {
        vertices: [false, true, true, true, false, false, true, false],
        names: {2: 'move', 3: 'width', 6: 'length', 1: 'height'},
        edge: 2,
      },
      3: {
        vertices: [true, false, true, true, false, false, false, true],
        names: {3: 'move', 2: 'width', 7: 'length', 0: 'height'},
        edge: 3,
      },
      6: {
        vertices: [false, false, true, false, false, true, true, true],
        names: {6: 'move', 7: 'width', 2: 'length', 5: 'height'},
        edge: 6,
      },
      7: {
        vertices: [false, false, false, true, true, false, true, true],
        names: {7: 'move', 6: 'width', 3: 'length', 4: 'height'},
        edge: 7,
      },
    };
    const primaryCorner = this._getPrimaryCorner(cuboid3d);

    return mapping[primaryCorner];
  }

  /**
   * @param {Cuboid3d} cuboid3d
   *
   * @private
   * @returns {number}
   */
  _getPrimaryCorner(cuboid3d) {
    const bottomPoints = [2, 3, 6, 7];

    return bottomPoints.reduce((prev, current) => {
      return cuboid3d.vertices[current].length() < cuboid3d.vertices[prev].length() ? current : prev;
    });
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
   * @param vector
   */
  addVectorToTop(vector) {
    [0, 1, 4, 5].map(pointIndex => {
      this._vertices[pointIndex] = [
        this._vertices[pointIndex][0] + vector.x,
        this._vertices[pointIndex][1] + vector.y,
        this._vertices[pointIndex][2] + vector.z,
      ];
    });
  }

  get bottomCenter() {
    return new Vector4(
      (this._vertices[2][0] + this._vertices[7][0]) / 2,
      (this._vertices[2][1] + this._vertices[7][1]) / 2,
      (this._vertices[2][2] + this._vertices[7][2]) / 2,
    );
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
}

/**
 * @param {Array.<THREE.Vector4>} vertices
 * @returns {Cuboid3d}
 */
Cuboid3d.createFromVectors = (vertices) => {
  return new Cuboid3d(vertices.map(vertex => [vertex.x, vertex.y, vertex.z]));
};

export default Cuboid3d;
