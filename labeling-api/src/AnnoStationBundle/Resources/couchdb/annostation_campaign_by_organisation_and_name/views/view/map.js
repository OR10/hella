function(doc) {
  if (doc.type === 'AnnoStationBundle.Model.Campaign') {
    emit([doc.organisationId, doc.name]);
  }
}
