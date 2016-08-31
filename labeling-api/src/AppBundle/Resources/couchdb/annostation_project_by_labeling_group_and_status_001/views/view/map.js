function(doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        emit([doc.labelingGroupId, doc.status], doc._id);
    }
}
