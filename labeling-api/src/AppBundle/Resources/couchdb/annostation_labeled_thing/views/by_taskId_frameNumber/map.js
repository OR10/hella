function(doc) {
  var frameIndex = 0;
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    for (frameIndex = doc.frameRange.startFrameNumber; frameIndex <= doc.frameRange.endFrameNumber; ++frameIndex) {
      emit([doc.taskId, frameIndex]);
    }
  }
}
