function(doc) {
  if (doc.type === 'AnnoStationBundle.Model.LabeledThingGroup') {
    emit([doc.taskId, doc.originalId]);
  }
}