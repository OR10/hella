function(doc) {
    if (doc.type !== 'AppBundle.Model.LabeledThingInFrame') {
        return;
    }

    doc.classes.forEach(function(class) {
        emit([doc.projectId, class, doc.frameIndex], 1);
    });
}
