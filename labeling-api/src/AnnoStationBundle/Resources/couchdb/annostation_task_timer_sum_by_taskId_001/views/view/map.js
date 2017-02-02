function (doc) {
  if (doc.type !== 'AppBundle.Model.TaskTimer') {
    return;
  }
  if (typeof doc.timeInSeconds === 'object') {
    emit(doc.taskId, doc.timeInSeconds);
  } else {
    emit(doc.taskId, {labeling: doc.timeInSeconds, review: 0, revision: 0});
  }
}