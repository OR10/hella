function(doc) {
  if (doc.type === 'AnnoStationBundle.Model.Organisation') {
    emit(doc._id);
  }
}
