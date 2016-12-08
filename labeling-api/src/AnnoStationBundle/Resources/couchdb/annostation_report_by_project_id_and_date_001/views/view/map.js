function(doc) {
    if (doc.type === 'AppBundle.Model.Report') {
        emit([doc.projectId, doc.reportCreationDate], doc._id);
    }
}
