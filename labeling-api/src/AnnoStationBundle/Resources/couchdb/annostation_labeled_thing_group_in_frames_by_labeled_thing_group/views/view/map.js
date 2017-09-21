function (doc) {
    if (doc.type === 'AnnoStationBundle.Model.LabeledThingGroupInFrame') {
        emit([doc.labeledThingGroupId], 1);
    }
}