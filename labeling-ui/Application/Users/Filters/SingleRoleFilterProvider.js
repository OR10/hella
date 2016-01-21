function SingleRoleFilterProvider() {
  return function singleRoleFilter(roles) {
    switch(true) {
      case roles.indexOf('ROLE_ADMIN') !== -1:
        return 'Administrator';
      case roles.indexOf('ROLE_LABEL_COORDINATOR') !== -1:
        return 'Label coordinator';
      case roles.indexOf('ROLE_USER') !== -1:
        return 'Labeler';
      default:
        return 'Unknown Role';
    }
  };
}

export default SingleRoleFilterProvider;