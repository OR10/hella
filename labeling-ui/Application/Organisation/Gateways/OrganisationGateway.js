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
    const url = this._apiService.getApiUrl('/organisation');
    return this._bufferedHttp.get(url, undefined, 'organisation')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result.map(
            doc => new Organisation(doc.id, doc.name, doc.quota)
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
    const url = this._apiService.getApiUrl(`/organisation/${organisation.id}`);

    return this._bufferedHttp.put(url, organisation.toJSON(), undefined, 'organisation')
      .then(response => {
        if (response.data) {
          const {id, name, quota} = response.data;

          return new Organisation(id, name, quota);
        }

        throw new Error(`Error updating the information for organisation with id "${organisation.id}"`);
      });
  }

  /**
   * Create a new organisation with the given name and quota
   *
   * @param {string} organisationName
   * @param {number} organisationQuota
   * @return {AbortablePromise<Organisation>}
   */
  createOrganisation(organisationName, organisationQuota = 0) {
    const url = this._apiService.getApiUrl(`/organisation`);
    const organisation = {
      name: organisationName,
      quota: organisationQuota,
    };

    return this._bufferedHttp.post(url, organisation, undefined, 'organisation')
      .then(response => {
        if (response.data) {
          const {id, name, quota} = response.data;

          return new Organisation(id, name, quota);
        }

        throw new Error(`Error creating the organisation with name "${organisationName}"`);
      });
  }
}

OrganisationGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default OrganisationGateway;
