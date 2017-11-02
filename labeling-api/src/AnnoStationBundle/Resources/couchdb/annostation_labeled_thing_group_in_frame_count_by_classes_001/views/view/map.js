function(doc) {
    if (doc.type === 'AnnoStationBundle.Model.LabeledThingGroupInFrame') {
        if (doc.classes.length > 0) {
            emit([doc.labeledThingGroupId, doc.frameIndex, doc.classes.length]);
        }
    }
}
