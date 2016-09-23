function(doc) {
  if (doc.type === 'AppBundle.Model.ProjectExport' && doc.deleted !== true) {
    emit([doc.projectId, doc.date || null]);
  }
}
