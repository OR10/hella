class DataPrefetcher {
  /**
   * @param apiService
   * @param $q
   * @param labeledThingInFrameGateway
   * @param labeledThingInFrameData
   * @param labeledFrameData
   */
  constructor(apiService, $q, labeledThingInFrameGateway, labeledThingInFrameData, labeledThingData, labeledFrameData) {
    this._apiService = apiService;
    this._$q = $q;
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    this._labeledThingInFrameData = labeledThingInFrameData;
    this._labeledThingData = labeledThingData;
    this._labeledFrameData = labeledFrameData;

    this._chunkSize = 20;
  }

  prefetchGhosts(task, startFrameNumber, labeledThing) {

  };

  prefetchLabeledThingsInFrame(task, startFrameNumber) {
    return this._prefetchLabeledThingsInFrame(task, startFrameNumber, this._chunkSize);
  }

  _prefetchLabeledThingsInFrame(task, startFrameNumber, limit) {
    console.log(`Prefetching LabeledThingsInFrame for frames ${startFrameNumber} - ${startFrameNumber + limit - 1}`);
    return this._labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame(task, startFrameNumber, limit).then(labeledThingsInFrame => {
      const dataByFrameNumber = {};

      labeledThingsInFrame.forEach(labeledThingInFrame => {
        if (dataByFrameNumber[labeledThingInFrame.frameNumber]) {
          dataByFrameNumber[labeledThingInFrame.frameNumber].push(labeledThingInFrame);
        } else {
          dataByFrameNumber[labeledThingInFrame.frameNumber] = [labeledThingInFrame];
        }
      });

      Object.keys(dataByFrameNumber).forEach(key => {
        const frameNumber = parseInt(key, 10);
        this._labeledThingInFrameData.set(frameNumber, dataByFrameNumber[frameNumber]);
      });

      const newStartFrameNumber = startFrameNumber + this._chunkSize;
      let newLimit = this._chunkSize;

      if (newStartFrameNumber > task.frameRange.endFrameNumber) {
        return Promise.resolve();
      }

      if (newStartFrameNumber + newLimit > task.frameRange.endFrameNumber) {
        newLimit -= newStartFrameNumber + newLimit - task.frameRange.endFrameNumber;
      }

      return this._prefetchLabeledThingsInFrame(task, newStartFrameNumber, newLimit);
    });
  }
}

DataPrefetcher.$inject = ['ApiService', '$q', 'labeledThingInFrameGateway', 'labeledThingInFrameData', 'labeledThingData', 'labeledFrameData'];

export default DataPrefetcher;
