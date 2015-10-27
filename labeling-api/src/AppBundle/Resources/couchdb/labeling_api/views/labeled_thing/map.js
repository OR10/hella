function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    emit(doc.labelingTaskId, doc);
  }
}
