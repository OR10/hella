function(doc) {
  if (doc.type === 'AppBundle.Model.TaskTimer') {
    emit(doc.projectId, doc.timeInSeconds);
  }
}
