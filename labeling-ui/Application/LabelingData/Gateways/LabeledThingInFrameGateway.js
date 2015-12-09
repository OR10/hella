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
   * @param {LabeledThingGateway} labeledThingGateway
   */
  constructor(apiService, bufferedHttp, $q, labeledThingGateway) {
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

    this._labeledThingGateway = labeledThingGateway;
  }

  /**
   * Returns the {@link LabeledThingInFrame} object for the given {@link Task} and `frameNumber`
   *
   * @param {Task} task
   * @param {Integer} frameNumber
   *
   * @returns {AbortablePromise<LabeledThingInFrame[]|Error>}
   */
  listLabeledThingInFrame(task, frameNumber) {
    const url = this._apiService.getApiUrl(
      `/task/${task.id}/labeledThingInFrame/${frameNumber}`
    );
    return this.bufferedHttp.get(url, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          response.data = {
            "result": {
              "labeledThings": {
                "1c874fa7-5e7b-43d1-9c76-d7183ba61595": {
                  "id": "1c874fa7-5e7b-43d1-9c76-d7183ba61595",
                  "rev": "1-60d2720b5f6ea00454540145b3713cf6",
                  "frameRange": {"startFrameNumber": 1, "endFrameNumber": 1},
                  "classes": [],
                  "taskId": "69ac41c0f5b5d807f77b2d6e0b078456",
                  "incomplete": true
                }
              },
              "labeledThingsInFrame": [
                {
                  "id": "a91923a7-881c-437f-a013-1bfaad40f0e4",
                  "rev": "7-d089335be3fe1089f4ee039cedd19c02",
                  "frameNumber": 1,
                  "classes": [],
                  "shapes": [
                    {
                      "type": "rectangle",
                      "id": "e926f315-1681-4810-acba-697fe798f76f",
                      "topLeft": {"x": 0, "y": 0},
                      "bottomRight": {"x": 200, "y": 200},
                      "labeledThingInFrameId": "a91923a7-881c-437f-a013-1bfaad40f0e4"
                    }
                  ],
                  "labeledThingId": "1c874fa7-5e7b-43d1-9c76-d7183ba61595",
                  "incomplete": true,
                  "ghost": false
                }
              ]
            }
          };

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
    console.log(labeledThingInFrame.shapes[0].topLeft, labeledThingInFrame.shapes[0].bottomRight);
    if (labeledThingInFrame.ghost === true) {
      return this._$q.reject(
        new Error('Tried to store a ghosted LabeledThingInFrame. This is not possible!')
      );
    }

    const url = this._apiService.getApiUrl(
      `/labeledThingInFrame/${labeledThingInFrame.id}`
    );

    return this.bufferedHttp.put(url, labeledThingInFrame, undefined, 'labeledThingInFrame')
      .then(response => {
        if (response.data && response.data.result) {
          return new LabeledThingInFrame(Object.assign({}, response.data.result, {labeledThing: labeledThingInFrame.labeledThing}));
        }

        throw new Error('Failed updating labeled thing in frame');
      });
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
  'labeledThingGateway',
];

export default LabeledThingInFrameGateway;
