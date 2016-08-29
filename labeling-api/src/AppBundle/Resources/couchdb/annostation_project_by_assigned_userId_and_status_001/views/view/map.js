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

    emit([coordinatorAssignmentHistory[0].userId, doc.status]);
}
