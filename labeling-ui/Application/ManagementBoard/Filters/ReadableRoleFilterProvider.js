function ReadableRoleFilterProvider() {
  return function readableRoleFilter(role) {
    switch (role) {
      case 'ROLE_SUPER_ADMIN':
        return 'SuperAdmin';
      case 'ROLE_LABEL_MANAGER':
        return 'Label Manager';
      case 'ROLE_LABELER':
        return 'Labeler';
      case 'ROLE_OBSERVER':
        return 'Observer';
      case 'ROLE_EXTERNAL_COORDINATOR':
        return 'External Coordinator';
      default:
        throw new Error(`Unknown Role: ${role}`);
    }
  };
}

export default ReadableRoleFilterProvider;
