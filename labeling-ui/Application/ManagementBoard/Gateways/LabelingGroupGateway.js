import LabelingGroup from '../Models/LabelingGroup';
import User from '../Models/User';

/**
 * Gateway for managing LabelingGroups
 */
class LabelingGroupGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     * @private
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     * @private
     */
    this._apiService = apiService;
  }

  /**
   * Retrieve all labeling groups
   *
   * @return {AbortablePromise<{users: Array<User>, labelingGroup: Object}|Error>}
   */
  getLabelingGroups() {
    const url = this._apiService.getApiUrl('/labelingGroup');
    return this._bufferedHttp.get(url, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result &&
          response.data.result.labelingGroups && Array.isArray(response.data.result.labelingGroups) &&
          response.data.result.users) {
          const users = {};
          Object.keys(response.data.result.users).forEach(userId => users[userId] = new User(response.data.result.users[userId]));
          return {
            labelingGroups: response.data.result.labelingGroups.map(group => new LabelingGroup(group)),
            users,
          };
        }

        throw new Error('Failed loading labeling group list.');
      });
  }

  /**
   * Get all labeling groups in which i am the coordinator
   *
   * @returns {AbortablePromise<LabelingGroup>|Error}
   */
  getMyLabelingGroups() {
    const url = this._apiService.getApiUrl('/labelingGroup/user/groups');
    return this._bufferedHttp.get(url, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeling groups for the current user.');
      });
  }

  /**
   * Create a new LabelingGroup
   *
   * @param {LabelingGroup} group
   * @return {AbortablePromise<LabelingGroup|Error>}
   */
  createLabelingGroup(group) {
    const url = this._apiService.getApiUrl('/labelingGroup');
    return this._bufferedHttp.post(url, group, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabelingGroup(response.data.result);
        }

        throw new Error('Failed creating labeling group.');
      });
  }

  /**
   * Update an existing LabelingGroup
   *
   * @param {LabelingGroup} group
   * @return {AbortablePromise<LabelingGroup|Error>}
   */
  updateLabelingGroup(group) {
    const url = this._apiService.getApiUrl(`/labelingGroup/${group.id}`);
    return this._bufferedHttp.put(url, group, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabelingGroup(response.data.result);
        }

        throw new Error('Failed updating labeling group.');
      });
  }

  /**
   * Delete an existing LabelingGroup
   *
   * @param {string} groupId
   * @return {AbortablePromise<boolean|Error>}
   */
  deleteLabelingGroup(groupId) {
    const url = this._apiService.getApiUrl(`/labelingGroup/${groupId}`);
    return this._bufferedHttp.delete(url, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed deleting labeling group.');
      });
  }
}

LabelingGroupGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabelingGroupGateway;
