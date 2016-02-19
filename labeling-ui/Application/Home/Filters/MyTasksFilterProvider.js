function MyTasksFilterProvider() {
  return function myTasksFilter(tasks, userId) {
    if (!tasks) {
      return [];
    } else {
      return tasks.filter(task => {
        return task.assignedUser === userId;
      })
    }
  };
}

export default MyTasksFilterProvider;
