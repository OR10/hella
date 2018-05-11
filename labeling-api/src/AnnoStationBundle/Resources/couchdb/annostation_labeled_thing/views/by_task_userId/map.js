function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    emit([doc.taskId, doc.createdByUserId]);
  }
}
