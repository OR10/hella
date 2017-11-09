import LabelStructureObject from './LabelStructureObject';

class LabelStructureThing extends LabelStructureObject {
  /**
   * @param {string} id
   * @param {string} name
   * @param {string} shape
   * @param {boolean} multiSelect
   */
  constructor(id, name, shape, multiSelect) {
    super(id);

    /**
     * @type {string}
     */
    this.name = name;

    /**
     * @type {string}
     */
    this.shape = shape;

    /**
     * @type {boolean}
     */
    this.multiSelect = multiSelect;
  }
}

export default LabelStructureThing;
