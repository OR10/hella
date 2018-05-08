function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingPrediction') {
        emit(doc.taskId);
    }
}
