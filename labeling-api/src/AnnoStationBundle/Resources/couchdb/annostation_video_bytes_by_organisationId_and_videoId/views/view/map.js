function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    if(doc.metaData.sizeInBytes) {
      emit([doc.organisationId, doc._id], parseInt(doc.metaData.sizeInBytes));
    }
  }
}
