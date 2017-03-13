function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    emit([doc.organisationId], 1);
  }
}
