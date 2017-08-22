import {clone, cloneDeep} from 'lodash';

/**
 * Model for a LabelingGroup
 */
class LabelingGroup {
  /**
   * @param {{id: string|undefined, labelManagers: Array.<string>, labeler: Array.<string>}} group
   */
  constructor(group) {
    // Required properties

    /**
     * @type {string|undefined}
     */
    this.id = group.id;

    /**
     * @type {string}
     */
    this.name = group.name;

    /**
     * @type {Array.<string>}
     */
    this.labelManagers = group.labelManagers;

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
    const {id, name, labelManagers, labelers} = this;
    return {
      labelManagers: cloneDeep(labelManagers),
      labeler: cloneDeep(labelers),
      name: clone(name),
      id,
    };
  }
}

export default LabelingGroup;
