function(doc) {
    if (doc.type === 'AppBundle.Model.Export') {
        emit([doc.projectId, doc.date]);
    }
}
