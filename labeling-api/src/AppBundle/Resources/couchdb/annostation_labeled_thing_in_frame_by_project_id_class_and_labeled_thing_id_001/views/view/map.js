function(doc) {
    if (doc.type !== 'AppBundle.Model.LabeledThingInFrame') {
        return;
    }

    doc.classes.forEach(function(class) {
        emit([doc.projectId, class, doc.labeledThingId], 1);
    });
}
