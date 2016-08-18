function(doc) {
    if (doc.type !== 'AppBundle.Model.TaskConfiguration') {
        return;
    }

    emit([doc.userId]);
}
