function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.coordinators.forEach(function (coordinator) {
            emit([doc.organisationId, coordinator], {id: doc._id, name: doc.name});
        });
    }
}
