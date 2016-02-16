import LabeledThingInFrame from '../Models/LabeledThingInFrame';
import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class LabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   * @param {$q} $q
   * @param {$http} $http
   * @param {LabeledThingGateway} labeledThingGateway
   * @param {DataContainer} labeledThingInFrameData
   * @param {DataContainer} labeledThingData
   * @param {AbortablePromiseFactory} abortablePromiseFactory
   */
  constructor(apiService, bufferedHttp, $q, $http, labeledThingGateway, labeledThingInFrameData, labeledThingData, abortablePromiseFactory) {
    /**
     * @type {BufferedHttp}
     */
    this.bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;

    /**
     * @type {$q}
     */
    this._$q = $q;

    /**
     * @type {$http}
     * @private
     */
    this._$http = $http;

    /**
     * @type {LabeledThingGateway}
     * @private
     */
    this._labeledThingGateway = labeledThingGateway;

    /**
     * @type {DataContainer}
     * @private
     */
    this._labeledThingInFrameData = labeledThingInFrameData;

    /**
     * @type {DataContainer}
     * @private
     */
    this._labeledThingData = labeledThingData;

    /**
     * @type {AbortablePromiseFactory}
     * @private
     */
    this._abortablePromiseFactory = abortablePromiseFactory;
  }

  /**
   * Fetches {@link LabeledThingInFrame} data for multiple frames at once.
   *
   * The request for fetching the data will not inherently be synchronized with other requests.
   *
   * @param {Task} task
   * @param {Number} startFrameNumber
   * @param {Number} [limit=1]
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  bulkFetchLabeledThingsInFrame(task, startFrameNumber, limit = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${startFrameNumber}?offset=0&limit=${limit}`
    );

    if (limit < 1) {
      return Promise.resolve([]);
    }

    return this.bufferedHttp.get(url, 'labeledThingInFrame-bulk').then(response => this._associateWithLabeledThings(task, response.data.result));
  }

  /**
   * @param {Task} task
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {Number[]}
   * @private
   */
  _getFrameNumberRange(task, offset, limit) {
    const endFrameNumber = offset + limit;
    let actualLimit = limit;

    if (endFrameNumber > task.frameRange.endFrameNumber) {
      return [];
    }

    if (endFrameNumber > task.frameRange.endFrameNumber) {
      actualLimit = endFrameNumber - task.frameRange.endFrameNumber;
    }

    return new Array(actualLimit).fill(null).map((ignored, index) => index + offset);
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameNumber`
   *
   * @param {Task} task
   * @param {Number} frameNumber
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );

    if (this._labeledThingInFrameData.has(frameNumber)) {
      return this._abortablePromiseFactory(this._$q.resolve(this._labeledThingInFrameData.get(frameNumber)));
    }

    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return this._associateWithLabeledThings(task, response.data.result);
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
  }


  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameNumber`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameNumber`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param {Task} task
   * @param {int} frameNumber
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameNumber, labeledThing, offset = 0, limit = 1) {
    if (this._labeledThingData.has(labeledThing.id)) {
      const startIndex = frameNumber - task.frameRange.startFrameNumber + offset;
      const labeledThingData = this._labeledThingData.get(labeledThing.id).slice(startIndex, startIndex + limit);

      return this._abortablePromiseFactory(this._$q.resolve(labeledThingData));
    }

    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}/${labeledThing.id}`,
      {offset, limit}
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          const labeledThingsInFrameData = response.data.result;
          return labeledThingsInFrameData.map(
            data => new LabeledThingInFrame(
              Object.assign({}, data, {labeledThing})
            )
          );
        }

        throw new Error('Failed loading labeled thing in frame');
      });
  }

  /**
   * Returns the next incomplete labeled things in frame.
   * The count can be specified, the default is one.
   *
   * @param {Task} task
   * @param {int?} count
   *
   * @returns {AbortablePromise<LabeledThingInFrame>|Error}
   */
  getNextIncomplete(task, count = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame`,
      {
        incompleteOnly: true,
        limit: count
      }
    );

    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading incomplete labeled thing in frame');
      });
  }

  /**
   * Associate the labeledThingsInFrame with their labeledThings
   *
   * After the {@link LabeledThing} is Retrieved it will be combined into a new {@link LabeledThingInFrame}
   *
   * @param {Task} task
   * @param {Object} labeledThingsInFrameData
   * @returns {Array.<LabeledThingInFrame>}
   * @private
   */
  _associateWithLabeledThings(task, labeledThingsInFrameData) {
    return labeledThingsInFrameData.labeledThingsInFrame.map(data => {
      const labeledThing = labeledThingsInFrameData.labeledThings[data.labeledThingId];
      labeledThing.task = task;

      return new LabeledThingInFrame(
        Object.assign({}, data, {
          labeledThing: new LabeledThing(labeledThing),
        })
      );
    });
  }

  /**
   * Update the {@link LabeledThingInFrame} with the given `id`.
   *
   * @param {LabeledThingInFrame} labeledThingInFrame
   *
   * @returns {AbortablePromise<LabeledThingInFrame|Error>}
   */
  saveLabeledThingInFrame(labeledThingInFrame) {
    if (labeledThingInFrame.ghost === true) {
      return this._$q.reject(
        new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!')
      );
    }

    this._labeledThingInFrameData.invalidateLabeledThing(labeledThingInFrame.labeledThing);
    this._labeledThingData.invalidate(labeledThingInFrame.labeledThing.id);

    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    if (!Array.isArray(labeledThingInFrame.classes) || labeledThingInFrame.classes.length === 0) {
      delete labeledThingInFrame.classes;
    }

    this._updateCacheForLabeledThingInFrame(labeledThingInFrame);

    return this.bufferedHttp.put(url, labeledThingInFrame, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingInFrame(
            Object.assign(
              {},
              response.data.result.labeledThingInFrame,
              {
                labeledThing: new LabeledThing(
                  Object.assign(
                    {},
                    response.data.result.labeledThing,
                    {task: labeledThingInFrame.labeledThing.task}
                  )
                ),
              }
            )
          );
        }

        throw new Error('Failed updating labeled thing in frame');
      });
  }

  /**
   * @param {LabeledThingInFrame} labeledThingInFrame
   * @private
   */
  _updateCacheForLabeledThingInFrame(labeledThingInFrame) {
    const frameNumber = labeledThingInFrame.frameNumber;

    if (this._labeledThingInFrameData.has(frameNumber)) {
      const oldFrameData = this._labeledThingInFrameData.get(frameNumber);

      const newFrameData = oldFrameData.filter(
        oldLabeledThingInFrame => {
          return oldLabeledThingInFrame.labeledThing.id !== labeledThingInFrame.labeledThing.id;
        }
      );

      newFrameData.push(labeledThingInFrame);

      this._labeledThingInFrameData.set(frameNumber, newFrameData);
    }
  }

  /**
   * Deletes the {@link LabeledThingInFrame} in the database
   *
   * @param {String} labeledThingInFrameId
   *
   * @returns {AbortablePromise<true|Error>}
   */
  deleteLabeledThingInFrame(labeledThingInFrameId) {
    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrameId}`
    );
    return this.bufferedHttp.delete(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data) {
          return true;
        }

        throw new Error('Failed deleting labeled thing in frame');
      });
  }
}

LabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
  '$q',
  '$http',
  'labeledThingGateway',
  'labeledThingInFrameData',
  'labeledThingData',
  'abortablePromiseFactory',
];

export default LabeledThingInFrameGateway;
