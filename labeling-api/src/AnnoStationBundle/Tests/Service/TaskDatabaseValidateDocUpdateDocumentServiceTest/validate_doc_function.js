function(newDoc, oldDoc, userCtx, secObj) {
  if (userCtx.name === 'admin' || secObj.assignedLabeler === userCtx.name) {
    return;
  }
  
  throw({forbidden: 'You are not authorized to write to this db.'});
}