function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.labeler.forEach(function (labeler) {
            emit(labeler, doc._id);
        });
    }
}
