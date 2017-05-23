function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
    emit([doc.taskId, doc.importLineNo], doc.importLineNo);
  }
}
