function(doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        emit([doc.userId, doc.status]);
    }
}
