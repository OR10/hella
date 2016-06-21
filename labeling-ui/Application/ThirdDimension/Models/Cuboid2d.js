import {Vector3} from 'three-math';
import clone from 'lodash.clone';

class Cuboid2d {
  /**
   * Construct a new Cuboid2d
   *
   * @param {Array.<Vector3|null>} vertices
   * @param {Array.<boolean>} vertexVisibility
   */
  constructor(vertices,
              vertexVisibility = [true, true, true, true, true, true, true, true]) {
    /**
     * @type {Array.<Array.<number>>}
     * @private
     */
    this._vertices = vertices;

    /**
     * @type {Array.<boolean>}
     * @private
     */
    this._vertexVisibility = vertexVisibility;
  }

  /**
   * Clone the current {@link Cuboid2d} object
   *
   * @returns {Cuboid2d}
   */
  clone() {
    return new Cuboid2d(
      this._vertices,
      this._vertexVisibility
    );
  }

  setVertices(vertices) {
    this._vertices = vertices;
    return this;
  }

  get vertices() {
    return this._vertices.map(vertex => vertex === null ? null : vertex.clone());
  }

  get vertexVisibility() {
    return clone(this._vertexVisibility);
  }
}

/**
 * @param {Array.<Array<Number>|null>} vertices
 * @param {Array.<boolean>} vertexVisibility
 * @returns {Cuboid2d}
 */
Cuboid2d.createFromRawVertices = (vertices, vertexVisibility) => {
  return new Cuboid2d(
    vertices.map(vertex => vertex === null ? null : new Vector3(vertex[0], vertex[1], 1)),
    vertexVisibility
  );
};

export default Cuboid2d;
