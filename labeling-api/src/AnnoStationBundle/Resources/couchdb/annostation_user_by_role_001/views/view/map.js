function(doc) {
  if (doc.type !== 'AppBundle.Model.User') {
    return;
  }

  doc.roles.forEach(function(role) {
    emit([role], doc._id);
  });
}
