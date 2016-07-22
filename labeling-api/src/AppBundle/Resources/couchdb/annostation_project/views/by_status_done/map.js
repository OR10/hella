function(doc) {
    if (doc.type === 'AppBundle.Model.Project' && doc.status === 'done') {
        emit([doc._id]);
    }
}
