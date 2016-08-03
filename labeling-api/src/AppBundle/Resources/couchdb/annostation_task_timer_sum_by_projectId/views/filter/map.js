function(doc) {
    if (doc.type === 'AppBundle.Model.TaskTimer') {
        if (doc.timeInSeconds.labeling) {
            emit(doc.projectId, doc.timeInSeconds.labeling);
        }
        if (doc.timeInSeconds.review) {
            emit(doc.projectId, doc.timeInSeconds.review);
        }
        if (doc.timeInSeconds.revision) {
            emit(doc.projectId, doc.timeInSeconds.revision);
        }
    }
}
