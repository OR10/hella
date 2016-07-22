function(doc) {
    if (doc.type === 'AppBundle.Model.Project' && doc.status === 'in_progress') {
        emit([doc._id]);
    }
}
