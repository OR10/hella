function(doc) {
  if (doc.type === 'AppBundle.Model.ProjectExport') {
    if (doc.deleted === true) {
      return;
    }
    if (typeof doc.status === 'object') {
      var statusHistory = [];
      doc.status.forEach(function (history) {
        statusHistory.push(history);
      });

      statusHistory.sort(function (a, b) {
        return b.timestamp - a.timestamp;
      });
      if (statusHistory[0].status !== 'deleted') {
        emit([doc.projectId, doc.date || null]);
      }
    }else{
      emit([doc.projectId, doc.date || null]);
    }
  }
}
