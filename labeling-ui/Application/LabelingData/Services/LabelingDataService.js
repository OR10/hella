/**
 * @class LabelingDataService
 *
 * Service for saving and retrieving Labeling Data
 */
export default class LabelingDataService {
  constructor(apiService, $http) {
    this.$http = $http;
    this.apiService = apiService;
  }

  /**
   * Returns the labeledThingInFrame object for the given task and frame number
   *
   * @param {Task} task
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledThingInFrame[]|Error>}
   */
  getLabeledThingsInFrame(task, frameNumber) {
    const url = this.apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeling data list');
      });
  }

  /**
   * Creates the labeling data objects in the database
   *
   * @param {Task} task
   * @param {LabeledThingInFrame} data
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  createLabeledThingsInFrame(task, frameNumber, data) {
    const url = this.apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.$http.post(url, data)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed creating labeling data object');
      });
  }

  /**
   * Updates the labeling data objects in the database
   *
   * @param {Task} task
   * @param {LabeledThingInFrame[]} data
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledThingInFrame[]|Error>}
   */
  updateLabeledThingsInFrame(task, frameNumber, data) {
    const url = this.apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.$http.put(url, data)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed updating labeling data');
      });
  }
}

LabelingDataService.$inject = ['ApiService', '$http'];
