function(doc) {
    if (doc.type === 'AppBundle.Model.Project' && doc.deleted !== true) {
        emit([doc.labelingGroupId], doc._id);
    }
}
