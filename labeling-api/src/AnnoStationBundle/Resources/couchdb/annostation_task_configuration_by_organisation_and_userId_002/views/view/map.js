function(doc) {
    if (doc.type !== 'AppBundle.Model.TaskConfiguration' &&
      doc.type !== 'AppBundle.Model.TaskConfiguration.SimpleXml' &&
      doc.type !== 'AppBundle.Model.TaskConfiguration.RequirementsXml') {
        return;
    }

    emit([doc.organisationId, doc.userId]);
}
