function(doc) {
  if (doc.type === 'AppBundle.Model.Role') {
    emit(doc.projectId, doc);
  }
}
