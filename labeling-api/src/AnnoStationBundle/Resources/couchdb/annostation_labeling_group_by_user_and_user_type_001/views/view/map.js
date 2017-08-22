function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.labelManagers.forEach(function(labelManagerId) {
            emit([labelManagerId, 'labelManager'], doc._id);
        });

        doc.labeler.forEach(function (labelerId) {
            emit([labelerId, 'labeler'], doc._id);
        });
    }
}
