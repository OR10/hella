class LabelStructureThing {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shape
   * @param {string} thingType
   */
  constructor(id, name, shape, thingType = 'thing') {
    /**
     * @type {string}
     */
    this.id = id;

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {string}
     */
    this.shape = shape;

    /**
     * @type {string}
     */
    this.thingType = thingType;
  }

  get type() {
    return this.id;
  }
}

export default LabelStructureThing;
