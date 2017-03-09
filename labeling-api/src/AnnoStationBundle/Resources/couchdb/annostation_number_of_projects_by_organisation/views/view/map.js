function(doc) {
  if (doc.type === 'AppBundle.Model.Project') {
    emit([doc.organisationId], 1);
  }
}
