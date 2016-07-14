function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask') {
        emit(doc.projectId, 1);
    }
}
