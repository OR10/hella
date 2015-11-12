/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class LabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {angular.$http} $http
   */
  constructor(apiService, $http) {
    /**
     * @type {angular.$http}
     */
    this.$http = $http;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameNumber`
   *
   * @param {Task} task
   * @param {Integer} frameNumber
   *
   * @returns {Promise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber) {
    const url = this._apiService.getApiUrl(
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
   * Retrieves the {@link LabeledThingInFrame} with the given `id`
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  getLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
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
   * Store a **new** {@link LabeledThingInFrame} to the backend
   *
   * @param {Task} task
   * @param {Integer} frameNumber
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  createLabeledThingInFrame(task, frameNumber, labeledThingInFrame) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    const unifiedLabeledThingInFrame = this._uniqueClasses(labeledThingInFrame);

    return this.$http.post(url, unifiedLabeledThingInFrame)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed creating LabeledThingInFrame');
      });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} newLabeledThingInFrame
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  updateLabeledThingInFrame(newLabeledThingInFrame) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${newLabeledThingInFrame.id}`
    );

    const labeledThingInFrame = this._uniqueClasses(newLabeledThingInFrame);

    return this.$http.put(url, labeledThingInFrame)
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed updating labeled thing in frame');
      });
  }

  /**
   * Deletes the {@link LabeledThingInFrame} in the database
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {Promise<true|Error>}
   */
  deleteLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
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
   * Adds classes to a {@link LabeledThingInFrame}
   *
   * This method is a shortcut to updating the {@link LabeledThingInFrame#classes} list and calling
   * {@link LabeledThingInFrameGateway#updateLabeledThingInFrame} on the modified object.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Array<string>} classes
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

  /**
   * Sets the classes array on a {@link LabeledThingInFrame}
   *
   * This method is a shortcut to updating the {@link LabeledThingInFrame#classes} list and calling
   * {@link LabeledThingInFrameGateway#updateLabeledThingInFrame} on the modified object.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @param {Array<string>} classes
   *
   * @returns {Promise<LabeledThingInFrame|Error>}
   */
  setClassesToLabeledThingInFrame(labeledThingInFrame, classes) {
    if (classes) {
      labeledThingInFrame.classes = classes;
    } else {
      labeledThingInFrame.classes = [];
    }

    return this.updateLabeledThingInFrame(labeledThingInFrame);
  }

  /**
   * Make the classes array on a {@link LabeledThingInFrame} unique
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @returns {LabeledThingInFrame}
   * @private
   */
  _uniqueClasses(labeledThingInFrame) {
    labeledThingInFrame.classes = [...new Set(labeledThingInFrame.classes)];

    return labeledThingInFrame;
  }
}

LabeledThingInFrameGateway.$inject = ['ApiService', '$http'];

export default LabeledThingInFrameGateway;
