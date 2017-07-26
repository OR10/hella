function(doc) {
  if (doc.type !== 'AppBundle.Model.MonitoringCheckResults') {
    return;
  }

  if (doc.globalCheckStatus === 'running') {
    return;
  }

  emit([doc.date], null);
}
