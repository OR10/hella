function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    doc.groupIds.forEach(
      function(groupId) {
        emit([groupId, doc.incomplete], 1);
      }
    );
  }
}