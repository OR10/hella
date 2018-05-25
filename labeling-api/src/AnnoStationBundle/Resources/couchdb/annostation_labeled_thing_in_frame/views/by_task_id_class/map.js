function(doc) {
    if (doc.type === 'AppBundle.Model.LabeledThingInFrame') {
      if(doc.classes.length > 0) {
        for(var idx in doc.classes) {
          emit([doc.taskId ,doc.classes[idx], doc.frameIndex], doc);
        }
      }
    }
}
