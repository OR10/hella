class DataPrefetcher {
  /**
   * @param apiService
   * @param $q
   * @param labeledThingInFrameData
   * @param labeledThingData
   * @param labeledFrameData
   */
  constructor(apiService, $q, labeledThingInFrameGateway, labeledThingInFrameData, labeledThingData, labeledFrameData) {
    this._apiService = apiService;
    this._$q = $q;
    this._labeledThingInFrameGateway = labeledThingInFrameGateway;
    this._labeledThingInFrameData = labeledThingInFrameData;
    this._labeledThingData = labeledThingData;
    this._labeledFrameData = labeledFrameData;

    this._chunkSize = 10;
  }

  prefetchGhosts(task, startFrameNumber, labeledThing) {

  };

  prefetchLabeledThingsInFrame(task, startFrameNumber) {
    return this._prefetchLabeledThingsInFrame(task, startFrameNumber, this._chunkSize);
  }

  prefetchSingleLabeledThing(task, labeledThing, startFrameNumber) {
    return this._prefetchSingleLabeledThing(task, labeledThing, startFrameNumber, this._chunkSize);
  }

  _prefetchSingleLabeledThing(task, labeledThing, offset, limit) {
    console.log(`Prefetching LabeledThing (${labeledThing.id}) for frames ${offset} - ${offset + limit}`);

    return this._labeledThingInFrameGateway.getLabeledThingInFrame(task, offset, labeledThing, 0, limit).then(dataByFrame => {
      console.log(dataByFrame);
      //dataByFrame.forEach((data, index) => {
      //  this._labeledThingInFrameData.set(offset + index, data);
      //});
      //
      //const newOffset = offset + this._chunkSize;
      //let newLimit = this._chunkSize;
      //
      //if (newOffset > task.frameRange.endFrameNumber) {
      //  return Promise.resolve();
      //}
      //
      //if (newOffset + newLimit > task.frameRange.endFrameNumber) {
      //  newLimit -= newOffset + newLimit - task.frameRange.endFrameNumber;
      //}
      //
      //return this._prefetchLabeledThingsInFrame(task, newOffset, newLimit);
    });
  }

  _prefetchLabeledThingsInFrame(task, offset, limit) {
    console.log(`Prefetching LabeledThingsInFrame for frames ${offset} - ${offset + limit}`);
    return this._labeledThingInFrameGateway.bulkFetchLabeledThingsInFrame(task, offset, limit).then(dataByFrame => {
      dataByFrame.forEach((data, index) => {
        this._labeledThingInFrameData.set(offset + index, data);
      });

      const newOffset = offset + this._chunkSize;
      let newLimit = this._chunkSize;

      if (newOffset > task.frameRange.endFrameNumber) {
        return Promise.resolve();
      }

      if (newOffset + newLimit > task.frameRange.endFrameNumber) {
        newLimit -= newOffset + newLimit - task.frameRange.endFrameNumber;
      }

      return this._prefetchLabeledThingsInFrame(task, newOffset, newLimit);
    });
  }
}

DataPrefetcher.$inject = ['ApiService', '$q', 'labeledThingInFrameGateway', 'labeledThingInFrameData', 'labeledThingData', 'labeledFrameData'];

export default DataPrefetcher;
