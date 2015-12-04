function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
    emit([doc.taskId, doc.frameNumber], doc);
  }
}
