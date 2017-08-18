function (doc) {
    if (doc.type !== 'AppBundle.Model.Project') {
        return;
    }
    if (doc.labelManagerAssignmentHistory === null) {
        return;
    }
    var labelManagerAssignmentHistory = [];
    doc.labelManagerAssignmentHistory.forEach(function (history) {
        labelManagerAssignmentHistory.push(history);
    });

    labelManagerAssignmentHistory.sort(function (a, b) {
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
        emit([doc.organisationId, labelManagerAssignmentHistory[0].userId, statusHistory[0].status]);
    }else{
        emit([doc.organisationId, labelManagerAssignmentHistory[0].userId, doc.status]);
    }
}
