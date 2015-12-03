function(doc) {
  if (doc.type === 'AppBundle.Model.TaskExport') {
    emit(doc._id, doc);
  }
}
