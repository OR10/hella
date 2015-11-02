/**
 * @class LabeledFrameGateway
 *
 * Gateway for saving and retrieving labeled frames
 */
export default class LabeledFrameGateway {
  constructor(apiService, $http) {
    this.$http = $http;
    this.apiService = apiService;
  }


  /**
   * Returns the labeled frame for the given task and frame number
   *
   * @param {String} taskId
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledFrame|Error>}
   */
  getLabeledFrame(taskId, frameNumber) {
    const url = this.apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameNumber}`
    );
    return this.$http.get(url)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading labeled frame');
      });
  }


  /**
   * Updates the labeled frame for the given task and frame number in the database
   *
   * @param {String} taskId
   * @param {Integer} frameNumber
   * @param {LabeledFrame} data
   *
   * @returns {Promise<LabeledFrame|Error>}
   */
  saveLabeledFrame(taskId, frameNumber, data) {
    const url = this.apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameNumber}`
    );

    const labeledFrame = this._uniqueClasses(data);

    return this.$http.put(url, labeledFrame)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed updating labeled frame');
      });
  }

  /**
   * Deletes the labeled thing in frame object in the database
   *
   * @param {String} taskId
   * @param {Integer} frameNumber
   *
   * @returns {Promise<Boolean|Error>}
   */
  deleteLabeledFrame(taskId, frameNumber) {
    const url = this.apiService.getApiUrl(
      `/task/${taskId}/labeledFrame/${frameNumber}`
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
   * Make the classes array on a labeled frame unique
   *
   * @private
   * @param {LabeledFrame} labeledFrame
   *
   * @returns {LabeledFrame}
   */
  _uniqueClasses(labeledFrame) {
    labeledFrame.classes = [...new Set(labeledFrame.classes)];

    return labeledFrame;
  }
}

LabeledFrameGateway.$inject = ['ApiService', '$http'];
