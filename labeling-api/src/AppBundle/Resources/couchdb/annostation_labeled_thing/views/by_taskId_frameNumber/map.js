function(doc) {
  var frameNumber = 0;
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    for (frameNumber = doc.frameRange.startFrameNumber; frameNumber <= doc.frameRange.endFrameNumber; ++frameNumber) {
      emit([doc.taskId, frameNumber]);
    }
  }
}
