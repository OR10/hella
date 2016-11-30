function(doc, req) {
  return doc.taskId === req.query.taskId;
}