/**
 * Service to provide generic information and handling utilities about the API communication
 */
class ApiService {
  /**
   * @param {Object} configuration injected
   * @param {$httpParamSerializer} $httpParamSerializer injected
   */
  constructor(configuration, $httpParamSerializer) {
    this.$httpParamSerializer = $httpParamSerializer;
    this.configuration = configuration;
  }

  /**
   * Create a url to request a certain api path on the backend
   *
   * @param {string} path
   * @param {Object} query
   * @returns {string}
   */
  getApiUrl(path, query = {}) {
    const {Common: {backendPrefix, apiPrefix}} = this.configuration;
    const location = `${backendPrefix}/${apiPrefix}/${path}`.replace(/\/\/+/g, '/');
    const encodedQuery = this.$httpParamSerializer(query);

    if (encodedQuery !== '') {
      return `${location}?${encodedQuery}`;
    }

    return location;
  }
}

ApiService.$inject = ['applicationConfig', '$httpParamSerializer'];

export default ApiService;
