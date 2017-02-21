function(doc) {
  if (doc.type === 'AppBundle.Model.CalibrationData') {
    emit(doc._id);
  }
}