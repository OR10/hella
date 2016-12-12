function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    emit(doc._id);
  }
}
