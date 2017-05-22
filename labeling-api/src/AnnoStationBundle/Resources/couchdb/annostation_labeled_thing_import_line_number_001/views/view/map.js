function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    emit([doc.taskId, doc.importLineNo], doc.importLineNo);
  }
}
