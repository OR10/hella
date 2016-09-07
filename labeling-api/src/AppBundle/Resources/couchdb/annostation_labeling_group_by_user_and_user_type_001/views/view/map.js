function(doc) {
    if (doc.type === 'AppBundle.Model.LabelingGroup') {
        doc.coordinators.forEach(function(coordinatorId) {
            emit([coordinatorId, 'coordinator'], doc._id);
        });

        doc.labeler.forEach(function (labelerId) {
            emit([labelerId, 'labeler'], doc._id);
        });
    }
}
