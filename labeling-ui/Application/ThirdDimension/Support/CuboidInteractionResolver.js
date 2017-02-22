import {forEach} from 'lodash';

/**
 * Resolver service capable of determining which interaction with a Cuboid causes which operation
 *
 * This service is capable of calculating the primary edge of a cuboid, as well as asigning operations to each of the handles,
 * based on this active primary edge.
 */
class CuboidInteractionResolver {
  /**
   * @param {Cuboid3d} cuboid3d
   */
  constructor(cuboid3d) {
    /**
     * @type {Cuboid3d}
     * @private
     */
    this._cuboid3d = cuboid3d;
  }

  /**
   * @param {Number} index
   */
  isPrimaryVertex(index) {
    const primaryVertices = {
      2: [false, true, true, true, false, false, true, false],
      3: [true, false, true, true, false, false, false, true],
      6: [false, false, true, false, false, true, true, true],
      7: [false, false, false, true, true, false, true, true],
    };

    return primaryVertices[this.getPrimaryCornerIndex()][index];
  }

  /**
   * @returns {Number}
   */
  getPrimaryCornerIndex() {
    const bottomPoints = [2, 3, 6, 7];

    return bottomPoints.reduce((prev, current) => {
      return this._cuboid3d.vertices[current].length() < this._cuboid3d.vertices[prev].length() ? current : prev;
    });
  }

  /**
   * @param {Number} index
   * @returns {Object}
   */
  resolveInteractionForVertex(index) {
    const primaryCornerIndex = this.getPrimaryCornerIndex();
    const interaction = {
      [CuboidInteractionResolver.ROTATE_MIDDLE_AXIS]: false,
      [CuboidInteractionResolver.ROTATE_PRIMARY_AXIS]: false,
      [CuboidInteractionResolver.DEPTH]: false,
      [CuboidInteractionResolver.WIDTH]: false,
      [CuboidInteractionResolver.HEIGHT]: false,
      [CuboidInteractionResolver.MOVE]: false,
    };

    switch (primaryCornerIndex) {
      case 2:
        switch (index) {
          case 1:
            interaction[CuboidInteractionResolver.HEIGHT] = true;
            break;
          case 2:
            interaction[CuboidInteractionResolver.MOVE] = true;
            break;
          case 3:
            interaction[CuboidInteractionResolver.WIDTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          case 6:
            interaction[CuboidInteractionResolver.DEPTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          default:
            throw new Error(`Cannot resolve action for the combination: primaryCorner = ${primaryCornerIndex} and pointIndex = ${index}`);
        }

        return interaction;
      case 3:
        switch (index) {
          case 0:
            interaction[CuboidInteractionResolver.HEIGHT] = true;
            break;
          case 2:
            interaction[CuboidInteractionResolver.WIDTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          case 3:
            interaction[CuboidInteractionResolver.MOVE] = true;
            break;
          case 7:
            interaction[CuboidInteractionResolver.DEPTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          default:
            throw new Error(`Cannot resolve action for the combination: primaryCorner = ${primaryCornerIndex} and pointIndex = ${index}`);
        }

        return interaction;
      case 6:
        switch (index) {
          case 2:
            interaction[CuboidInteractionResolver.DEPTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          case 5:
            interaction[CuboidInteractionResolver.HEIGHT] = true;
            break;
          case 6:
            interaction[CuboidInteractionResolver.MOVE] = true;
            break;
          case 7:
            interaction[CuboidInteractionResolver.WIDTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          default:
            throw new Error(`Cannot resolve action for the combination: primaryCorner = ${primaryCornerIndex} and pointIndex = ${index}`);
        }

        return interaction;
      case 7:
        switch (index) {
          case 3:
            interaction[CuboidInteractionResolver.DEPTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          case 4:
            interaction[CuboidInteractionResolver.HEIGHT] = true;
            break;
          case 6:
            interaction[CuboidInteractionResolver.WIDTH] = true;
            // interaction[CuboidInteractionResolver.ROTATE_PRIMARY_AXIS] = true;
            break;
          case 7:
            interaction[CuboidInteractionResolver.MOVE] = true;
            break;
          default:
            throw new Error(`Cannot resolve action for the combination: primaryCorner = ${primaryCornerIndex} and pointIndex = ${index}`);
        }
        return interaction;
      default:
    }
  }

  /**
   * @param {string} interaction
   * @returns {Number[]}
   */
  resolveAffectedVerticesForInteraction(interaction) {
    const primaryCornerIndex = this.getPrimaryCornerIndex();

    switch (interaction) {
      case CuboidInteractionResolver.ROTATE_MIDDLE_AXIS:
        return [0, 1, 2, 3, 4, 5, 6, 7];
      case CuboidInteractionResolver.ROTATE_PRIMARY_AXIS:
        switch (primaryCornerIndex) {
          case 2:
            return [0, 3, 4, 5, 6, 7];
          case 3:
            return [1, 2, 4, 5, 6, 7];
          case 6:
            return [0, 1, 2, 3, 4, 7];
          case 7:
            return [0, 1, 2, 3, 5, 6];
          default:
        }
        break;
      case CuboidInteractionResolver.DEPTH:
        switch (primaryCornerIndex) {
          case 2:
          case 3:
            return [4, 5, 6, 7];
          case 6:
          case 7:
            return [0, 1, 2, 3];
          default:
        }
        break;
      case CuboidInteractionResolver.WIDTH:
        switch (primaryCornerIndex) {
          case 2:
          case 6:
            return [0, 3, 4, 7];
          case 3:
          case 7:
            return [1, 2, 5, 6];
          default:
        }
        break;
      case CuboidInteractionResolver.HEIGHT:
        return [0, 1, 4, 5];
      case CuboidInteractionResolver.MOVE:
        return [0, 1, 2, 3, 4, 5, 6, 7];
      default:
        throw new Error(`The interaction "${interaction}" cannot be resolved.`);
    }
  }

  /**
   * @param {Object} interaction
   * @returns {string}
   */
  getHandleNameFromInteraction(interaction) {
    let result;
    forEach(interaction, (value, key) => {
      if (value) {
        result = key;
      }
    });

    return result;
  }

  /**
   * @param {string} name
   * @returns {Number}
   */
  getVertexIndexFromHandleName(name) {
    const primaryCornerIndex = this.getPrimaryCornerIndex();
    switch (name) {
      case CuboidInteractionResolver.DEPTH:
        switch (primaryCornerIndex) {
          case 2:
            return 6;
          case 3:
            return 7;
          case 6:
            return 2;
          case 7:
            return 3;
          default:
        }
        break;
      case CuboidInteractionResolver.WIDTH:
        switch (primaryCornerIndex) {
          case 2:
            return 3;
          case 3:
            return 2;
          case 6:
            return 7;
          case 7:
            return 6;
          default:
        }
        break;
      case CuboidInteractionResolver.HEIGHT:
        switch (primaryCornerIndex) {
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
        break;
      case CuboidInteractionResolver.MOVE:
        return this.getPrimaryCornerIndex();
      default:
        throw new Error(`There is no handle with the name "${name}" to get the vertex for.`);
    }
  }
}

CuboidInteractionResolver.ROTATE_MIDDLE_AXIS = 'rotateMiddleAxis';
CuboidInteractionResolver.ROTATE_PRIMARY_AXIS = 'rotatePrimaryAxis';
CuboidInteractionResolver.DEPTH = 'depth';
CuboidInteractionResolver.WIDTH = 'width';
CuboidInteractionResolver.HEIGHT = 'height';
CuboidInteractionResolver.MOVE = 'move';

export default CuboidInteractionResolver;
