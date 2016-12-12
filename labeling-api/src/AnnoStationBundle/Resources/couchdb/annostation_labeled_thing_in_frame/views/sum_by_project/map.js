function(doc) {
    if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        emit(doc.projectId, 1);
    }
}
