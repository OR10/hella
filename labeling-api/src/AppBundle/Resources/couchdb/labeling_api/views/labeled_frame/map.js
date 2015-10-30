function(doc) {
    if (doc.type === 'AppBundle.Model.LabeledFrame') {
        emit([doc.labelingTaskId, doc.frameNumber], doc);
    }
}
