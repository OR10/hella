function(doc) {
  var frameIndex = 0;
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    for (frameIndex = doc.frameRange.startFrameIndex; frameIndex <= doc.frameRange.endFrameIndex; ++frameIndex) {
      emit([doc.taskId, frameIndex]);
    }
  }
}
