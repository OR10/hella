function(doc) {
  if (doc.type === 'AppBundle.Model.LabelingGroup') {
    emit(doc._id);
  }
}