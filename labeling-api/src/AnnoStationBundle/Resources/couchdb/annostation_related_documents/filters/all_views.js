function(doc) {
  return doc._id.indexOf('_design/') === 0 && doc.views !== undefined;
}