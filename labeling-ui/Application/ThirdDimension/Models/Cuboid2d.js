import {Vector3} from 'three-math';
import clone from 'lodash.clone';

class Cuboid2d {
  /**
   * @param {Array.<Array.<number>>} vertices
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

  get vertices() {
    return this._vertices.map(vertex => new Vector3(...vertex, 1));
  }

  get vertexVisibility() {
    return clone(this._vertexVisibility);
  }

  get primaryVertices() {
    return clone(this._primaryVertices);
  }

}

/**
 * @param {Cuboid2d} cuboid2d
 * @param {Array.<THREE.Vector3>} vertices
 * @returns {Cuboid2d}
 */
Cuboid2d.createFromCuboid2dAndVectors = (cuboid2d, vertices) => {
  return new Cuboid2d(
    vertices.map(vertex => [vertex.x, vertex.y]),
    cuboid2d.vertexVisibility
  );
};

export default Cuboid2d;
