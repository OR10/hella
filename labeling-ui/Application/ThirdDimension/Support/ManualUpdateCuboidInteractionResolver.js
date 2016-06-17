import CuboidInteractionResolver from './CuboidInteractionResolver';
import _ from 'lodash';

/**
 * Resolver service capable of determining which interaction with a Cuboid causes which operation
 *
 * This service is capable of calculating the primary edge of a cuboid, as well as asigning operations to each of the handles,
 * based on this active primary edge.
 */
class ManualUpdateCuboidInteractionResolver extends CuboidInteractionResolver {
  /**
   * @param {Cuboid3d} cuboid3d
   */
  constructor(cuboid3d) {
    super(cuboid3d);

    /**
     * @type {Number[]}
     * @private
     */
    this._primaryVertices = [];

    /**
     *
     * @type {Number}
     * @private
     */
    this._primaryCornerIndex = null;

    /**
     * @type {Object}
     * @private
     */
    this._interaction = [];

    /**
     * @type {Number[]}
     * @private
     */
    this._affectedVertices = [];
  }

  /**
   * Reset the cached data to regenerate them on the next function call
   */
  updateData() {
    this._primaryVertices = [];
    this._primaryCornerIndex = null;
    this._interaction = [];
    this._affectedVertices = [];
  }

  /**
   * @param {Number} index
   */
  isPrimaryVertex(index) {
    if (!this._primaryVerices || !this._primaryVerices[index]) {
      this._primaryVertices[index] = super.isPrimaryVertex(index);
    }

    return this._primaryVertices[index];
  }

  /**
   * @returns {Number}
   */
  getPrimaryCornerIndex() {
    if (!this._primaryCornerIndex) {
      this._primaryCornerIndex = super.getPrimaryCornerIndex();
    }
    return this._primaryCornerIndex;
  }

  /**
   * @param {Number} index
   * @returns {Object}
   */
  resolveInteractionForVertex(index) {
    if (!this._interaction || !this._interaction[index]) {
      this._interaction[index] = super.resolveInteractionForVertex(index);
    }

    return this._interaction[index];
  }

  /**
   * @param {string} interaction
   * @returns {Number[]}
   */
  resolveAffectedVerticesForInteraction(interaction) {
    if (!this._affectedVertices || !this._affectedVertices[interaction]) {
      this._affectedVertices[interaction] = super.resolveAffectedVerticesForInteraction(interaction);
    }

    return this._affectedVertices[interaction];
  }
}

export default ManualUpdateCuboidInteractionResolver;