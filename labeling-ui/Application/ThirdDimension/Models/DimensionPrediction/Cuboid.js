class CuboidDimensionPrediction {
  /**
   * @param {{width: Number, height: Number, depth: Number}} prediction
   */
  constructor(prediction) {
    const {width, height, depth} = prediction;

    /**
     * @type {Number}
     */
    this.width = width;

    /**
     * @type {Number}
     */
    this.height = height;

    /**
     * @type {Number}
     */
    this.depth = depth;
  }
}

CuboidDimensionPrediction.supportsType = type => ['cuboid'].includes(type);

export default CuboidDimensionPrediction;
