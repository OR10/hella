function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    Object.keys(doc.imageTypes).forEach(function(type) {
      if (doc.imageTypes[type]['accumulatedSizeInBytes'] !== undefined) {
        emit([doc.organisationId, type, doc._id], doc.imageTypes[type]['accumulatedSizeInBytes']);
      }
    });
  }
}
