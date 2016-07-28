import cloneDeep from 'lodash.clonedeep';

/**
 * Model for a LabelingGroup
 */
class LabelingGroup {
  /**
   * @param {{id: string|undefined, coordinators: Array.<string>, labeler: Array.<string>}} group
   */
  constructor(group) {
    // Required properties

    /**
     * @type {string|undefined}
     */
    this.id = group.id;

    /**
     * @type {Array.<string>}
     */
    this.coordinators = group.coordinators;

    /**
     * @type {Array.<string>}
     */
    this.labelers = group.labeler;

    // Fix typo in request for now
    if (group.labelers !== undefined) {
      this.labelers = group.labelers;
    }
  }

  /**
   * Convert this model into a datastructure suitable for backend storage
   *
   * @return {Object}
   */
  toJSON() {
    const {id, coordinators, labelers} = this;
    return {
      coordinators: cloneDeep(coordinators),
      labeler: cloneDeep(labelers),
      id};
  }
}

export default LabelingGroup;
