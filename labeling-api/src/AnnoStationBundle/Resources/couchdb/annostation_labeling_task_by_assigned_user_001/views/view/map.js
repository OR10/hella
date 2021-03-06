function(doc) {
  if (doc.type === 'AppBundle.Model.LabelingTask') {
    var statusHistory = [];
    doc.assignmentHistory.forEach(function (history) {
      statusHistory.push(history);
    });

    statusHistory.sort(function (a, b) {
      return b.assignedAt - a.assignedAt;
    });
    emit([doc.projectId, statusHistory[0].userId], doc._id);
  }
}
