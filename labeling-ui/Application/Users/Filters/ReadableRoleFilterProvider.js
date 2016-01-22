function ReadableRoleFilterProvider() {
  return function readableRoleFilter(role) {
    switch(role) {
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_LABEL_COORDINATOR':
        return 'Label Coordinator';
      case 'ROLE_USER':
        return 'Labeler';
      default:
        throw new Error(`Unknown Role: ${role}`);
    }
  };
}

export default ReadableRoleFilterProvider;
