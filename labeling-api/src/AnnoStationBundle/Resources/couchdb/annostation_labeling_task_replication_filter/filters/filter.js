function(doc, req) {
  if (req.query.taskId === undefined) {
    return false;
  }
  if (
    doc.taskId === undefined ||
      doc.type === undefined
  ) {
    return false;
  }
  if (doc.taskId !== req.query.taskId) {
    return false;
  }
  if (
    doc.type !== 'AppBundle.Model.LabeledThingInFrame' &&
    doc.type !== 'AppBundle.Model.LabeledThing' &&
    doc.type !== 'AppBundle.Model.TaskTimer'
  ) {
    return false;
  }

  return true;
}