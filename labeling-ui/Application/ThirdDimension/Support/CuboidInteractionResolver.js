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
  // isPrimaryVertex(index) {
  //
  // }


  /**
   * @returns {Number}
   */
  // getPrimaryCornerIndex() {
  //   // returns index
  // }

  /**
   * @param {Number} index
   * @returns {Object}
   */
  // resolveInteractionForVertex(index) {
  //   // Based on original front orientation of cuboid
  //   return {
  //     [CuboidInteractionResolver.ROTATE_MIDDLE_AXIS]: false,
  //     [CuboidInteractionResolver.ROTATE_PRIMARY_AXIS]: true,
  //     [CuboidInteractionResolver.DEPTH]: true,
  //     [CuboidInteractionResolver.WIDTH]: false,
  //     [CuboidInteractionResolver.HEIGHT]: false,
  //   };
  // }

  /**
   * @param {string} interaction
   */
  // resolveAffectedVerticesForInteraction(interaction) {
  //   // return indices of all the vertices, which will affected by the transformation
  //   switch (interaction) {
  //     case CuboidInteractionResolver.ROTATE_MIDDLE_AXIS:
  //       break;
  //     // ...
  //     default:
  //   }
  // }
}

CuboidInteractionResolver.ROTATE_MIDDLE_AXIS = 'rotateMiddleAxis';
CuboidInteractionResolver.ROTATE_PRIMARY_AXIS = 'rotatePrimaryAxis';
CuboidInteractionResolver.DEPTH = 'depth';
CuboidInteractionResolver.WIDTH = 'width';
CuboidInteractionResolver.HEIGHT = 'height';
