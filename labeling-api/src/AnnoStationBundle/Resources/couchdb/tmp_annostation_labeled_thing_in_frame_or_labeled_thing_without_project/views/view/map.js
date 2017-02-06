function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThingInFrame' || doc.type === 'AppBundle.Model.LabeledThing') {
    if (doc.projectId === undefined) {
      emit(doc.projectId, 1);
    }
  }
}
