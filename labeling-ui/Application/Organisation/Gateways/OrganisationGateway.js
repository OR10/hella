import Organisation from '../Models/Organisation';

class OrganisationGateway {
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
   * Gets all available organisations
   *
   * @return {AbortablePromise<Array.<Organisation>|Error>}
   */
  getOrganisations() {
    const url = this._apiService.getApiUrl('/v1/organisation');
    return this._bufferedHttp.get(url, undefined, 'organisation')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result.map(
            doc => new Organisation(doc)
          );
        }

        throw new Error('Failed loading all available organisations');
      });
  }

  /**
   * Updates the given organisation in the database
   *
   * @return {AbortablePromise<Organisation|Error>}
   */
  updateOrganisation(organisation) {
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisation.id}`);

    return this._bufferedHttp.put(url, organisation.toJSON(), undefined, 'organisation')
      .then(response => {
        if (response.data && response.data.result) {
          return new Organisation(response.data.result);
        }

        throw new Error(`Error updating the information for organisation with id "${organisation.id}"`);
      });
  }

  /**
   * Create a new organisation with the given name and quota.
   * Quota is given in bytes and defaults to 2 GB
   *
   * @param {string} organisationName
   * @param {number} organisationQuota
   * @return {AbortablePromise<Organisation>}
   */
  createOrganisation(organisationName, organisationQuota = 2147483648, organisationUserQuota = 0) {
    const url = this._apiService.getApiUrl(`/v1/organisation`);
    const organisation = {
      name: organisationName,
      quota: organisationQuota,
      userQuota: organisationUserQuota,
    };

    return this._bufferedHttp.post(url, organisation, undefined, 'organisation')
      .then(response => {
        if (response.data && response.data.result) {
          return new Organisation(response.data.result);
        }

        throw new Error(`Error creating the organisation with name "${organisationName}"`);
      });
  }

  /**
   * @param {User} user
   * @param {Organisation} organisation
   * @return {AbortablePromise}
   */
  removeUserFromOrganisation(user, organisation) {
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisation.id}/user/${user.id}/unassign`);

    return this._bufferedHttp.delete(url, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed removing user with id ${user.id} from organisation with id ${organisation.id}`);
        }

        return response.data.result.success;
      });
  }

  /**
   * @param {User} user
   * @param {Organisation} organisation
   * @return {AbortablePromise}
   */
  addUserToOrganisation(user, organisation) {
    const url = this._apiService.getApiUrl(`/v1/organisation/${organisation.id}/user/${user.id}/assign`);

    return this._bufferedHttp.put(url, undefined, undefined, 'user')
      .then(response => {
        if (!response.data || !response.data.result || !response.data.result.success) {
          throw new Error(`Failed adding user with id ${user.id} to organisation with id ${organisation.id}`);
        }

        return response.data.result.success;
      });
  }
}

OrganisationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default OrganisationGateway;
