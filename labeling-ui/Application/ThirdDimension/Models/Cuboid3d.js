import {Vector4} from 'three-math';

class Cuboid3d {
  constructor(vertices) {
    this._vertices = vertices;
  }

  moveBy(vector) {
    this._vertices = this._vertices.map(vertex => {
      return [
        vertex[0] + vector.x,
        vertex[1] + vector.y,
        vertex[2] + vector.z,
      ];
    });
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
  return new Cuboid3d(vertices.map(v => [v.x, v.y, v.z]));
};

export default Cuboid3d;
