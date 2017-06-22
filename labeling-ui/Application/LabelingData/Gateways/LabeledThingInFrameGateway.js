import LabeledThingInFrame from '../Models/LabeledThingInFrame';
import LabeledThing from '../Models/LabeledThing';

/**
 * Gateway for saving and retrieving {@link LabeledThingInFrame}s
 */
class LabeledThingInFrameGateway {
  /**
   * @param {ApiService} apiService
   * @param {BufferedHttp} bufferedHttp
   */
  constructor(apiService, bufferedHttp) {
    /**
     * @type {BufferedHttp}
     */
    this.bufferedHttp = bufferedHttp;

    /**
     * @type {ApiService}
     */
    this._apiService = apiService;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameIndex`
   *
   * @param {Task} task
   * @param {Number} frameIndex
   * @param {Number} offset
   * @param {Number} limit
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameIndex, offset = 0, limit = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameIndex}`,
      {offset, limit}
    );

    return this.bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return this._associateWithLabeledThings(task, response.data.result);
        }

        throw new Error('Failed loading labeled thing in frame list');
      });
  }


  /**
   * Retrieve a {@link LabeledThingInFrame} which is associated to a specific
   * {@link Task}, {@link LabeledThing} and `frameIndex`.
   *
   * If the `LabeledThingInFrame` does not exist in the database an interpolated ghost frame is returned
   *
   * Optionally an `offset` and `limit` may be specified, which relates to the specified `frameIndex`.
   * By default `offset = 0` and `limit = 1` is assumed.
   *
   * @param {Task} task
   * @param {int} frameIndex
   * @param {LabeledThing} labeledThing
   * @param {int?} offset
   * @param {int?} limit
   */
  getLabeledThingInFrame(task, frameIndex, labeledThing, offset = 0, limit = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameIndex}/${labeledThing.id}`,
      {offset, limit}
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          const result = response.data.result;
          return result.map(
            data => new LabeledThingInFrame(
              Object.assign({}, data, {labeledThing, task: labeledThing.task}),
            ),
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
   * @returns {AbortablePromise<Array.<LabeledThingInFrame>>|Error}
   */
  getNextIncomplete(task, count = 1) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame`,
      {
        incompleteOnly: true,
        limit: count,
      }
    );

    return this.bufferedHttp.get(url, undefined, 'labeledThing')
      .then(response => {
        if (response.data && response.data.result) {
          return response.data.result;
        }

        throw new Error('Failed loading incomplete labeled thing in frame');
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
      throw new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!');
    }

    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    if (labeledThingInFrame.ghostClasses !== null && !!labeledThingInFrame.classes) {
      delete labeledThingInFrame.classes;
    }

    return this.bufferedHttp.put(url, labeledThingInFrame, undefined, 'labeledThing')
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

        throw new Error('Failed updating LabeledThingInFrame');
      });
  }

  /**
   * Associate the labeledThingsInFrame with their labeledThings
   *
   * After the {@link LabeledThing} is Retrieved it will be combined into a new {@link LabeledThingInFrame}
   *
   * @param {Task} task
   * @param {Object} result
   * @returns {Array.<LabeledThingInFrame>}
   * @protected
   */
  _associateWithLabeledThings(task, result) {
    return result.labeledThingsInFrame.map(data => {
      const labeledThing = result.labeledThings[data.labeledThingId];
      labeledThing.task = task;

      return new LabeledThingInFrame(
        Object.assign({}, data, {labeledThing: new LabeledThing(labeledThing)}, {task}),
      );
    });
  }

}

LabeledThingInFrameGateway.$inject = [
  'ApiService',
  'bufferedHttp',
];

export default LabeledThingInFrameGateway;
