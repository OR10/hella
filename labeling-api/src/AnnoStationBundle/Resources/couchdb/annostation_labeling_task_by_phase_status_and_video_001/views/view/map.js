function(doc) {
    if (doc.type !== 'AppBundle.Model.LabelingTask') {
        return;
    }

    if (typeof doc.status === 'object') {
        Object.keys(doc.status).forEach(function(phase) {
            emit([phase, doc.status[phase], doc.videoId]);
        });
    } else {
        // Migration of status from string to object
        // See AppBundle\Migration\LabelingTaskStatusPhase
        emit(['labeling', doc.status, doc.videoId]);
    }
}
