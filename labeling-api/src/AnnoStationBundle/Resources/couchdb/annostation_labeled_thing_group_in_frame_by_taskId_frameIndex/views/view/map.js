function(doc) {
  if (doc.type === 'AppBundle.Model.LabeledThing') {
    doc.groupIds.forEach(
      function(groupId) {
        for (var i = doc.frameRange.startFrameIndex; i <= doc.frameRange.endFrameIndex; i++) {
          emit([doc.taskId, i], groupId);
        }
      }
    );
  }
}