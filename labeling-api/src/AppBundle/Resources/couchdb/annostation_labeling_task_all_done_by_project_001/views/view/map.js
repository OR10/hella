function(doc) {
  if (doc.type === 'AppBundle.Model.LabelingTask') {
    var allDone = true;
    Object.keys(doc.status).forEach(function(phase) {
      if (doc.status[phase] !== 'done') {
        allDone = false;
      }
    });
    if (allDone) {
      emit([doc.projectId]);
    }
  }
}
