function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    Object.keys(doc.imageTypes).forEach(function(type) {
      if (doc.imageTypes[type]['sizeInBytes'] !== undefined) {
        Object.keys(doc.imageTypes[type]['sizeInBytes']).forEach(function(filePath) {
          emit([doc.organisationId, doc._id, type], doc.imageTypes[type]['sizeInBytes'][filePath]);
        });
      }
    });
  }
}
