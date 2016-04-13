function(doc) {
  if (doc.type === 'AppBundle.Model.VideoExport') {
    emit(doc.videoId);
  }
}
