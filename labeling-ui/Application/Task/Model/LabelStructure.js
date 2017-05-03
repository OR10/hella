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
  getEnabledClassesForLabeledObjectAndClassList(thing, classList) { // eslint-disable-line no-unused-vars
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
   * Retrieve a `Map` of all `Groups` defined inside the {@link LabelStructure}.
   *
   * @abstract
   * @return {Map.<string, LabelStructureThing>}
   */
  getGroups() {
    throw new Error('Abstract method must be implemented in child class');
  }

  /**
   * Retrieve a `Map` of all `Frames` defined inside the {@link LabelStructure}.
   *
   * @abstract
   * @return {Map.<string, LabelStructureThing>}
   */
  getRequirementFrames() {
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
    if (!this.isThingDefinedById(identifier)) {
      throw new Error(`Thing with identifier '${identifier}' could not be found in LabelStructure`);
    }

    const things = this.getThings();
    return things.get(identifier);
  }

  /**
   * Retrieve a Group defined inside a {@link LabelStructure} based on its `id`
   *
   * In case an invalid (not defined) `identifier` is specified an exception is thrown.
   *
   * @param {string} identifier
   * @returns {LabelStructureThing}
   */
  getGroupById(identifier) {
    if (!this.isGroupDefinedById(identifier)) {
      throw new Error(`Group with identifier '${identifier}' could not be found in LabelStructure`);
    }

    const groups = this.getGroups();
    return groups.get(identifier);
  }

  /**
   * Retrieve a Frame defined inside a {@link LabelStructure} based on its `id`
   *
   * In case an invalid (not defined) `identifier` is specified an exception is thrown.
   *
   * @param {string} identifier
   * @returns {LabelStructureThing}
   */
  getRequirementFramesById(identifier) {
    if (!this.isRequirementFrameDefinedById(identifier)) {
      throw new Error(`Frame with identifier '${identifier}' could not be found in LabelStructure`);
    }

    const requirementFrames = this.getRequirementFrames();
    return requirementFrames.get(identifier);
  }

  /**
   * Retrieve information about whether a thing with a specific id is defined inside this {@link LabelStructure}
   *
   * @param {string} identifier
   * @returns {boolean}
   */
  isThingDefinedById(identifier) {
    const things = this.getThings();
    return things.has(identifier);
  }

  /**
   * Retrieve information about whether a group with a specific id is defined inside this {@link LabelStructure}
   *
   * @param {string} identifier
   * @returns {boolean}
   */
  isGroupDefinedById(identifier) {
    const groups = this.getGroups();
    return groups.has(identifier);
  }

  /**
   * Retrieve information about whether a frame with a specific id is defined inside this {@link LabelStructure}
   *
   * @param {string} identifier
   * @returns {boolean}
   */
  isRequirementFrameDefinedById(identifier) {
    const requirementFrames = this.getRequirementFrames();
    return requirementFrames.has(identifier);
  }
}

export default LabelStructure;
