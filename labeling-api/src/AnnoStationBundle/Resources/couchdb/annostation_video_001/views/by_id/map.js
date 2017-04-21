function(doc) {
    if (doc.type === 'AppBundle.Model.Video') {
        emit(doc._id, doc.name);
    }
}
