function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    Object.keys(doc.imageTypes).forEach(
      function(imageType) {
        if (doc.imageTypes[imageType].failed !== undefined && doc.imageTypes[imageType].failed === true) {
          emit([doc._id, imageType]);
        }
      }
    );
  }
}
