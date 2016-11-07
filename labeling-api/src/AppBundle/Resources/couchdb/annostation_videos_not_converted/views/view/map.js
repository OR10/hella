function(doc) {
  if (doc.type === 'AppBundle.Model.Video') {
    Object.keys(doc.imageTypes).forEach(
      function(imageType) {
        if (doc.imageTypes[imageType].converted !== undefined && doc.imageTypes[imageType].converted === false) {
          emit([doc._id, imageType]);
        }
      }
    );
  }
}
