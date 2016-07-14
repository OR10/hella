function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status === 'waiting') {
        emit(doc.projectId, 1);
    }
}
