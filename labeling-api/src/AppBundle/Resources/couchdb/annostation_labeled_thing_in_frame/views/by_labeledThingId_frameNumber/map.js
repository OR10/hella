function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
    emit([doc.labeledThingId, doc.frameNumber], doc);
  }
}
