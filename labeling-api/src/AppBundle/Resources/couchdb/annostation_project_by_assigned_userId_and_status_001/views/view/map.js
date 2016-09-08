function (doc) {
    if (doc.type !== 'AppBundle.Model.Project') {
        return;
    }
    if (doc.coordinatorAssignmentHistory === null) {
        return;
    }
    var coordinatorAssignmentHistory = [];
    doc.coordinatorAssignmentHistory.forEach(function (history) {
        coordinatorAssignmentHistory.push(history);
    });

    coordinatorAssignmentHistory.sort(function (a, b) {
        return b.assignedAt - a.assignedAt;
    });

    if (typeof doc.status === 'object') {
        var statusHistory = [];
        doc.status.forEach(function (history) {
            statusHistory.push(history);
        });

        statusHistory.sort(function (a, b) {
            return b.timestamp - a.timestamp;
        });
        emit([coordinatorAssignmentHistory[0].userId, statusHistory[0].status]);
    }else{
        emit([coordinatorAssignmentHistory[0].userId, doc.status]);
    }
}
