/**
 * Gateway for requesting campaign information
 */
class CampaignGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.bufferedHttp} bufferedHttp
   * @param {OrganisationService} organisationService
   */
  constructor(apiService, bufferedHttp, organisationService) {
    /**
     * @type {angular.bufferedHttp}
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
   * @returns {Promise<Array<Campaign>>}
   */
  getCampaigns() {
    const organisationId = this._organisationService.get();

    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/campaign`);

    return this._bufferedHttp.get(url, undefined, 'campaign')
      .then(response => response.data.result);
  }

  /**
   * @param {Object} data
   * @returns {*}
   */
  createCampaign(name) {
    const organisationId = this._organisationService.get();
    const url = this._apiService.getApiUrl(`/organisation/${organisationId}/campaign`);
    return this._bufferedHttp.post(url, {name: name}, undefined, 'campaign')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed creating the campaign`);
      });
  }
}

CampaignGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  'organisationService',
];

export default CampaignGateway;
