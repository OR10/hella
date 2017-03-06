function(doc) {
  if (doc.type === 'AppBundle.Model.User') {
    emit(doc._id, null);
  }
}
