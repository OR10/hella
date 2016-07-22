function SingleRoleFilterProvider() {
  return function singleRoleFilter(roles) {
    switch (true) {
      case roles.indexOf('ROLE_ADMIN') !== -1:
        return 'ROLE_ADMIN';
      case roles.indexOf('ROLE_LABEL_COORDINATOR') !== -1:
        return 'ROLE_LABEL_COORDINATOR';
      case roles.indexOf('ROLE_LABELER') !== -1:
        return 'ROLE_LABELER';
      default:
        throw new Error(`Unknown Role setup for user: ${roles.toString()}`);
    }
  };
}

export default SingleRoleFilterProvider;
