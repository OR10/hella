function(doc) {
    if (doc.type !== 'AppBundle.Model.LabelingTask') {
        return;
    }

    if (typeof doc.status === 'object') {
        Object.keys(doc.status).forEach(function(phase) {
            emit([doc.projectId, phase, doc.status.labeling], 1);
        });
    } else {
        // Migration of status from string to object
        // See AppBundle\Migration\LabelingTaskStatusPhase
        emit([doc.projectId, 'labeling', doc.status], 1);
    }
}
