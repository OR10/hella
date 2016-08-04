function (doc) {
    if (doc.type !== 'AppBundle.Model.TaskTimer') {
        return;
    }
    if (typeof doc.timeInSeconds === 'object') {
        emit(doc.projectId, doc.timeInSeconds);
    } else {
        emit(doc.projectId, {labeling: doc.timeInSeconds, review: 0, revision: 0});
    }
}