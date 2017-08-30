function SingleRoleFilterProvider() {
  return function singleRoleFilter(roles) {
    switch (true) {
      case roles.indexOf('ROLE_SUPER_ADMIN') !== -1:
        return 'ROLE_SUPER_ADMIN';
      case roles.indexOf('ROLE_LABEL_MANAGER') !== -1:
        return 'ROLE_LABEL_MANAGER';
      case roles.indexOf('ROLE_LABELER') !== -1:
        return 'ROLE_LABELER';
      case roles.indexOf('ROLE_OBSERVER') !== -1:
        return 'ROLE_OBSERVER';
      case roles.indexOf('ROLE_EXTERNAL_COORDINATOR') !== -1:
        return 'ROLE_EXTERNAL_COORDINATOR';
      default:
        throw new Error(`Unknown Role setup for user: ${roles.toString()}`);
    }
  };
}

export default SingleRoleFilterProvider;
