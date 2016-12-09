function(doc) {
    if (doc.type === 'AppBundle.Model.Report') {
        emit([doc.projectId]);
    }
}
