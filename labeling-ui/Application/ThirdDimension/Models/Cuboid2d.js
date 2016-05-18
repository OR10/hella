import {Vector3} from 'three-math';
import clone from 'lodash.clone';

class Cuboid2d {
  /**
   * @param {Array.<Array.<number>>} vertices
   * @param {Array.<boolean>} vertexVisibility
   */
  constructor(vertices, vertexVisibility = [true, true, true, true, true, true, true, true]) {
    this._vertices = vertices;
    this._vertexVisibility = vertexVisibility;
  }

  get vertices() {
    return this._vertices.map(vertex => new Vector3(...vertex, 1));
  }

  get vertexVisibility() {
    return clone(this._vertexVisibility);
  }

  get frontTopLeft() {
    return new Vector3(...this._vertices[0], 1);
  }

  get frontTopRight() {
    return new Vector3(...this._vertices[1], 1);
  }

  get frontBottomRight() {
    return new Vector3(...this._vertices[2], 1);
  }

  get frontBottomLeft() {
    return new Vector3(...this._vertices[3], 1);
  }

  get backTopLeft() {
    return new Vector3(...this._vertices[4], 1);
  }

  get backTopRight() {
    return new Vector3(...this._vertices[5], 1);
  }

  get backBottomRight() {
    return new Vector3(...this._vertices[6], 1);
  }

  get backBottomLeft() {
    return new Vector3(...this._vertices[7], 1);
  }

  get isFrontTopLeftVisible() {
    return this._vertexVisibility[0];
  }

  get isFrontTopRightVisible() {
    return this._vertexVisibility[1];
  }

  get isFrontBottomRightVisible() {
    return this._vertexVisibility[2];
  }

  get isFrontBottomLeftVisible() {
    return this._vertexVisibility[3];
  }

  get isBackTopLeftVisible() {
    return this._vertexVisibility[4];
  }

  get isBackTopRightVisible() {
    return this._vertexVisibility[5];
  }

  get isBackBottomRightVisible() {
    return this._vertexVisibility[6];
  }

  get isBackBottomLeftVisible() {
    return this._vertexVisibility[7];
  }
}

export default Cuboid2d;
