function(doc) {
    if (doc.type === 'AppBundle.Model.Project') {
        if (typeof doc.status === 'object') {
            var statusHistory = [];
            doc.status.forEach(function (history) {
                statusHistory.push(history);
            });

            statusHistory.sort(function (a, b) {
                return b.timestamp - a.timestamp;
            });

            emit([doc.organisationId, statusHistory[0].status]);
        }else{
            emit([doc.organisationId, doc.status]);
        }
    }
}
