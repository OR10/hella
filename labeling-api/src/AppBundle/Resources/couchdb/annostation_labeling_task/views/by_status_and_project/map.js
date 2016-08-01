function(doc) {
  if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.labeling) {
    emit(['labeling', doc.status.labeling, doc.projectId]);
  }
  if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.review) {
    emit(['review', doc.status.review, doc.projectId]);
  }
  if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.revision) {
    emit(['revision', doc.status.revision, doc.projectId]);
  }
}
