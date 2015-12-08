function(doc) {
    if (doc.type === 'AppBundle.Model.LabeledFrame') {
        emit([doc.taskId, doc.frameNumber]);
    }
}
