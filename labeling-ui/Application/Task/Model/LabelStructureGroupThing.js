import LabelStructureThing from './LabelStructureThing';

class LabelStructureGroupThing extends LabelStructureThing {
  /**
   * @param {string} type
   * @param {string} name
   * @param {string} shape
   */
  constructor(type, name, shape = 'rectangle') {
    super(type, name, shape);
  }

  /**
   * Convenience function to access the type of a group through the type property
   *
   * @return {string}
   */
  get type() {
    return this.id;
  }
}

export default LabelStructureGroupThing;
