function(doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        emit([doc.status, doc._id], 1);
    }
}
