/**
 * Gateway for retrieving the labeling data structure of a task
 */
class LabelStructureGateway {
  /**
   * @param {ApiService} apiService injected
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     */
    this._bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Retrieves the {@link Task} identified by the given `id`
   *
   * @param {string} id
   *
   * @return {AbortablePromise.<Task|Error>}
   */
  getLabelStructureData(id) {
    const url = this._apiService.getApiUrl(`/task/${id}/labelStructure`);
    return this._bufferedHttp.get(url, undefined, 'task')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error(`Failed loading task with id ${id}`);
      });
  }
}

LabelStructureGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabelStructureGateway;
