function toFrameNumberFilterProvider(frameIndexService) {
  function toFrameNumber(frameIndex) {
    const numericalFrameIndex = parseInt(frameIndex, 10);
    return frameIndexService.getFrameNumber(numericalFrameIndex);
  }
  
  return toFrameNumber;
}

toFrameNumberFilterProvider.$inject = [
  'frameIndexService',
];

export default toFrameNumberFilterProvider;