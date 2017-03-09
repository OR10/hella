function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        emit([doc.organisationId], doc._id);
    }
}
