function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingTask') {
        emit(doc.videoId);
    }
}
