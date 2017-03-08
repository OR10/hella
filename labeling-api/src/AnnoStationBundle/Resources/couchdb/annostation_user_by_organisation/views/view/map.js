function(doc) {
  if (doc.type === 'AppBundle.Model.User') {
    doc.organisations.forEach(function (organisationId) {
      emit([organisationId], doc._id);
    });
  }
}