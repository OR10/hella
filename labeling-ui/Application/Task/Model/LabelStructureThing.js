import LabelStructureObject from './LabelStructureObject';

class LabelStructureThing extends LabelStructureObject {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shape
   */
  constructor(id, name, shape) {
    super(id);

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {string}
     */
    this.shape = shape;
  }
}

export default LabelStructureThing;
