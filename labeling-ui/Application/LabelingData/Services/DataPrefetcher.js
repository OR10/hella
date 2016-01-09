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

  prefetchSingleLabeledThing(task, labeledThing, startFrameNumber, refetch = false) {
    if (!refetch && this._labeledThingData.has(labeledThing.id)) {
      return;
    }

    const frameCount = task.frameRange.endFrameNumber - startFrameNumber + 1;

    this._labeledThingData.invalidate(labeledThing.id);

    console.log(`Prefetching LabeledThing (${labeledThing.id}) for frames ${startFrameNumber} - ${task.frameRange.endFrameNumber}`);

    return this._labeledThingInFrameGateway.getLabeledThingInFrame(task, startFrameNumber, labeledThing, 0, frameCount)
      .then(data => {
        this._labeledThingData.set(labeledThing.id, data);
      });
  }

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

      for (let index = startFrameNumber; index <= startFrameNumber + limit - 1; index++) {
        this._labeledThingInFrameData.set(index, dataByFrameNumber[index] || []);
      }

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
