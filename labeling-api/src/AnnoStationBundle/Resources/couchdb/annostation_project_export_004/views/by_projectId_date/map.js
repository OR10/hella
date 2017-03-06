function(doc) {
  if (doc.type === 'AppBundle.Model.ProjectExport') {
    emit([doc.projectId, doc.date || null]);
  }
}
