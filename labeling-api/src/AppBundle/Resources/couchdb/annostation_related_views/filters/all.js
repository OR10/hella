function(doc, req) {
  var isDesignDocument = doc._id.indexOf('_design/') === 0;
  var hasView = typeof doc.views === 'object';
  return isDesignDocument && hasView;
}