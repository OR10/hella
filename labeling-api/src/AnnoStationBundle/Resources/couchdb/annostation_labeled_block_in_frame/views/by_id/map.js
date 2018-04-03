function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledBlockInFrame') {
    emit(doc._id);
  }
}
