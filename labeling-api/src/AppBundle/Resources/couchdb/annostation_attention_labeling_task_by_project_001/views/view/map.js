function(doc) {
  if (doc.type === 'AppBundle.Model.LabelingTask' && doc.attentionFlags.task === true) {
    emit([doc.projectId], 1);
  }
}
