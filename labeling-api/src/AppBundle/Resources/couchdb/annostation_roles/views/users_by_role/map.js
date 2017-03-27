function(doc) {
  if (doc.type !== 'AppBundle.Model.User') {
    return;
  }

  Object.keys(doc.projectRoles).forEach(function(projectId) {
    doc.projectRoles[projectId].roleIds.forEach(function(roleId) {
      emit(roleId, null);
    });
  });
}
