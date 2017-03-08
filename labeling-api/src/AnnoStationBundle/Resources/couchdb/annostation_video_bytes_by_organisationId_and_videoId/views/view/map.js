function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    emit([doc.organisationId, doc._id], parseInt(doc.metaData.sizeInBytes));
  }
}
