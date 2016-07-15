function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask') {
        emit([doc.projectId, doc.status], 1);
    }
}
