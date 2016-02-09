function(doc) {
    if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
        if (doc.classes.length > 0) {
            emit([doc.labeledThingId, doc.frameNumber, doc.classes.length]);
        }
    }
}
