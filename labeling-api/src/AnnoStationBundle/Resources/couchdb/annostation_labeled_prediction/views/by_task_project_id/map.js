function(doc) {
  if (doc.type === 'AnnoStationBundle.Model.LabelingPrediction') {
    emit([doc.taskId, doc.projectId]);
  }
}