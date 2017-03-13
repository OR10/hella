function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.labeler.forEach(function (labeler) {
            emit([doc.organisationId, labeler], doc._id);
        });
    }
}
