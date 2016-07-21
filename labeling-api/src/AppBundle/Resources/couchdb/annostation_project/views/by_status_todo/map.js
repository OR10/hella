function(doc) {
    if (doc.type === 'AppBundle.Model.Project' && doc.status === 'todo') {
        emit([doc._id]);
    }
}
