function(doc) {
  if (doc.type !== 'AppBundle.Model.User') {
    return;
  }

  if(typeof doc.projectRoles === 'undefined') {
    return;
  }

  Object.keys(doc.projectRoles).forEach(function(projectId) {
    doc.projectRoles[projectId].roleIds.forEach(function(roleId) {
      emit(roleId, null);
    });
  });
}
