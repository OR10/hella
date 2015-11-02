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
  listLabeledThingInFrame(task, frameNumber) {
    const url = this.apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
  }

  /**
   * Returns the labeled thing in frame object with the given id
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  getLabeledThingInFrame(labeledThingInFrameId) {
    const url = this.apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeled thing in frame');
      });
  }

  /**
   * Creates a labeled thing in frame object in the database
   *
   * @param {Task} task
   * @param {LabeledThingInFrame} data
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  createLabeledThingInFrame(task, frameNumber, data) {
    const url = this.apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.$http.post(url, data)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed creating labeled thing in frame');
      });
  }

  /**
   * Updates the labeled thing in frame with the given id in the database
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  updateLabeledThingInFrame(labeledThingInFrame) {
    const url = this.apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );
    return this.$http.put(url, labeledThingInFrame)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed updating labeled thing in frame');
      });
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {Promise<Boolean|Error>}
   */
  deleteLabeledThingInFrame(labeledThingInFrameId) {
    const url = this.apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.$http.delete(url)
      .then(response => {
        if (response.data) {
          return true;
        }

        throw new Error('Failed deleting labeled thing in frame');
      });
  }

  /**
   * Adds classes to a labeled thing in frame object
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {String[]} classes
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  addClassesToLabeledThingInFrame(labeledThingInFrame, classes) {
    if (labeledThingInFrame.classes) {
      labeledThingInFrame.classes = labeledThingInFrame.classes.concat(classes);
    } else {
      labeledThingInFrame.classes = classes;
    }

    return this.updateLabeledThingInFrame(labeledThingInFrame);
  }
}

LabelingDataService.$inject = ['ApiService', '$http'];
