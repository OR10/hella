function ReadableRoleFilterProvider() {
  return function readableRoleFilter(role) {
    switch (role) {
      case 'ROLE_SUPER_ADMIN':
        return 'SuperAdmin';
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_CLIENT_COORDINATOR':
        return 'Client + Coordinator';
      case 'ROLE_LABEL_COORDINATOR':
        return 'Label Coordinator';
      case 'ROLE_LABELER':
        return 'Labeler';
      case 'ROLE_CLIENT':
        return 'Client';
      case 'ROLE_OBSERVER':
        return 'Observer';
      default:
        throw new Error(`Unknown Role: ${role}`);
    }
  };
}

export default ReadableRoleFilterProvider;
