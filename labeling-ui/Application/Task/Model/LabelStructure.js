/**
 * Base class for all implementations of labelstructure (class/value) information
 *
 * There may exist different types of those labelStructures (eg. legacy, requirementsXml, ...)
 *
 *  @abstract
 */
class LabelStructure {
  /**
   * Based on a given set of `classes` (Ltif classes) create and return a list of active classes (requirements classes),
   * which should currently be displayed.
   *
   * The list does not contain any nested classes. It is a processed list, which takes into account all conditions
   * defined by the utilized {@link LabelStructure}.
   *
   * @abstract
   * @param {LabelStructureThing} thing
   * @param {Array.<string>} classList
   * @return {Array.<object>}
   */
  getEnabledThingClassesForThingAndClassList(thing, classList) { // eslint-disable-line no-unused-vars
    throw new Error('Abstract method must be implemented in child class');
  }

  /**
   * Retrieve a `Map` of all `Things` defined inside the {@link LabelStructure}.
   *
   * @abstract
   * @return {Map.<string, LabelStructureThing>}
   */
  getThings() {
    throw new Error('Abstract method must be implemented in child class');
  }

  /**
   * Retrieve a Thing defined inside a {@link LabelStructure} based on its `id`
   *
   * In case an invalid (not defined) `identifier` is specified an exception is thrown.
   *
   * @param {string} identifier
   * @returns {LabelStructureThing}
   */
  getThingById(identifier) {
    const things = this.getThings();
    if (!things.has(identifier)) {
      throw new Error(`Thing with identifier '${identifier}' could not be found in LabelStructure`)
    }

    return things.get(identifier);
  }
}

export default LabelStructure;
