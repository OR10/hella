function(doc) {
    if (doc.type === 'AppBundle.Model.Video') {
        emit([doc.name]);
    }
}
