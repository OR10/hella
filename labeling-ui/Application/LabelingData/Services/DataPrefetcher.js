/**
 * Service for pre-loading data.
 *
 * This class can be interpreted as a worker thread reacting to frame position changes using a specific pre-loading
 * strategy or just as a facade for our gateways which is manually called by another service acting as the strategist.
 */
class DataPrefetcher {
  /**
   * @param {ApiService} apiService
   * @param {angular.$q} $q
   * @param {LabeledThingInFrameGateway} labeledThingInFrameGateway
   * @param {LabeledThingInFrameDataContainer} labeledThingInFrameData
   * @param {DataContainer} labeledThingData
   * @param {Logger} logger
   */
  constructor(apiService, $q, labeledThingInFrameGateway, labeledThingInFrameData, labeledThingData, logger) {
    this._apiService = apiService;
    this._$q = $q;
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    this._labeledThingInFrameData = labeledThingInFrameData;
    this._labeledThingData = labeledThingData;
    this._logger = logger;

    this._logFacility = 'DataPrefetcher';
    this._chunkSize = 20;
  }

  /**
   * @param {Task} task
   * @param {LabeledThing} labeledThing
   * @param {Number} startFrameNumber
   * @param {Boolean} refetch
   *
   * @returns {Promise}
   */
  prefetchSingleLabeledThing(task, labeledThing, startFrameNumber, refetch = false) {
    if (!refetch && this._labeledThingData.has(labeledThing.id)) {
      return this._$q.resolve();
    }

    const frameCount = task.frameRange.endFrameNumber - startFrameNumber + 1;

    this._labeledThingData.invalidate(labeledThing.id);

    this._logger.log(this._logFacility, `Prefetching LabeledThing (${labeledThing.id}) for frames ${startFrameNumber} - ${task.frameRange.endFrameNumber}`);

    return this._labeledThingInFrameGateway.getLabeledThingInFrame(task, startFrameNumber, labeledThing, 0, frameCount)
      .then(
        data => {
          this._labeledThingData.set(labeledThing.id, data);
          this._labeledThingInFrameData.setLabeledThingData(labeledThing, data);
        }
      );
  }

  /**
   * @param {Task} task
   * @param {Number} startFrameNumber
   * @returns {AbortablePromise}
   */
  prefetchLabeledThingsInFrame(task, startFrameNumber) {
    return this._prefetchLabeledThingsInFrame(task, startFrameNumber, this._chunkSize);
  }

  /**
   * @param {Task} task
   * @param {Number} startFrameNumber
   * @param {Number} limit
   * @returns {AbortablePromise}
   *
   * @private
   */
  _prefetchLabeledThingsInFrame(task, startFrameNumber, limit) {
    this._logger.log(this._logFacility, `Prefetching LabeledThingsInFrame for frames ${startFrameNumber} - ${startFrameNumber + limit - 1}`);

    return this._labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame(task, startFrameNumber, limit).then(
      labeledThingsInFrame => {
        const dataByFrameNumber = {};

        labeledThingsInFrame.forEach(
          labeledThingInFrame => {
            if (dataByFrameNumber[labeledThingInFrame.frameNumber]) {
              dataByFrameNumber[labeledThingInFrame.frameNumber].push(labeledThingInFrame);
            } else {
              dataByFrameNumber[labeledThingInFrame.frameNumber] = [labeledThingInFrame];
            }
          }
        );

        for (let index = startFrameNumber; index <= startFrameNumber + limit - 1; index++) {
          this._labeledThingInFrameData.set(index, dataByFrameNumber[index] || []);
        }

        const newStartFrameNumber = startFrameNumber + this._chunkSize;
        const newLimit = Math.min(this._chunkSize, task.frameRange.endFrameNumber - newStartFrameNumber + 1);

        if (newStartFrameNumber > task.frameRange.endFrameNumber) {
          return Promise.resolve();
        }

        return this._prefetchLabeledThingsInFrame(task, newStartFrameNumber, newLimit);
      }
    );
  }
}

DataPrefetcher.$inject = [
  'ApiService',
  '$q',
  'labeledThingInFrameGateway',
  'labeledThingInFrameData',
  'labeledThingData',
  'loggerService',
];

export default DataPrefetcher;
