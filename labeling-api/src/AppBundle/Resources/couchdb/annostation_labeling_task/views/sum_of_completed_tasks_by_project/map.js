function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask' && doc.status === 'labeled') {
        emit(doc.projectId, 1);
    }
}
