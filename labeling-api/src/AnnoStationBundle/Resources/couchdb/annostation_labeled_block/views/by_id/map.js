function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledBlock') {
    emit(doc._id);
  }
}
