function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.labelManagers.forEach(function (labelManager) {
            emit([doc.organisationId, labelManager], {id: doc._id, name: doc.name});
        });
    }
}
