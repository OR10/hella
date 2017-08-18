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
      default:
        throw new Error(`Unknown Role: ${role}`);
    }
  };
}

export default ReadableRoleFilterProvider;
