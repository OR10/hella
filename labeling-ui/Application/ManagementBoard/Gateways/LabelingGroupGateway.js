import LabelingGroup from '../Models/LabelingGroup';
import User from '../Models/User';
import DeleteLabelGroupErrorOfInProgressProjects from './Errors/DeleteLabelGroupErrorOfInProgressProjects';

/**
 * Gateway for managing LabelingGroups
 */
class LabelingGroupGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, organisationService) {
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

    /**
     * @type {OrganisationService}
     * @private
     */
    this._organisationService = organisationService;
  }

  /**
   * Retrieve all labeling groups for the current organisation
   *
   * @return {AbortablePromise<{users: Array<User>, labelingGroup: Object}|Error>}
   */
  getLabelingGroups() {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup`);

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
   * Get all labeling groups in which i am the coordinator for the current organisation
   *
   * @returns {AbortablePromise<LabelingGroup>|Error}
   */
  getMyLabelingGroups() {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup/user/groups`);

    return this._bufferedHttp.get(url, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeling groups for the current user.');
      });
  }

  /**
   * Get all label coordinators for the current organisation
   *
   * @returns {AbortablePromise|Error}
   */
  getLabelCoordinators() {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup/user/coordinators`);

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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup`);
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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup/${group.id}`);
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
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/labelingGroup/${groupId}`);
    return this._bufferedHttp.delete(url, undefined, 'labelingGroups')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        if (response.data && response.data.error) {
          throw new DeleteLabelGroupErrorOfInProgressProjects(
            response.data.error.message,
            response.data.error.projectNames
          );
        }

        throw new Error('Failed deleting labeling group. Please contact your administrator.');
      });
  }
}

LabelingGroupGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  'organisationService',
];

export default LabelingGroupGateway;
