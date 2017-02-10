function(doc) {
  if (doc.type === 'AppBundle.Model.TaskConfiguration.RequirementsXml' || doc.type === 'AppBundle.Model.TaskConfiguration.SimpleXml') {
    Object.keys(doc.hashes).forEach(
      function(filename) {
        emit([doc.userId, doc.name, filename, doc.hashes[filename]], doc._id);
      }
    );
  }
}