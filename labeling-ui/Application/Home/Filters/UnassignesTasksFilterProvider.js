function UnassignesTasksFilterProvider() {
  return function unassignedTasksFilter(tasks) {
    if (!tasks) {
      return [];
    }

    return tasks.filter(task => {
      return task !== null && task.assignedUser === null;
    });
  };
}

export default UnassignesTasksFilterProvider;
