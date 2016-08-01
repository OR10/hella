function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.labeling) {
        emit([doc.projectId, 'labeling', doc.status.labeling], 1);
    }
    if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.review) {
        emit([doc.projectId, 'review', doc.status.review], 1);
    }
    if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status.revision) {
        emit([doc.projectId, 'revision', doc.status.revision], 1);
    }
}
