function ReadableRoleFilterProvider() {
  return function readableRoleFilter(role) {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_LABEL_COORDINATOR':
        return 'Label Coordinator';
      case 'ROLE_LABELER':
        return 'Labeler';
      case 'ROLE_CLIENT':
        return 'Client';
      default:
        throw new Error(`Unknown Role: ${role}`);
    }
  };
}

export default ReadableRoleFilterProvider;
