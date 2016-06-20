function OtherPeopleTasksFilterProvider() {
  return function otherPeopleTasksFilter(tasks, userId) {
    if (!tasks) {
      return [];
    }

    return tasks.filter(task => {
      return task.assignedUser !== userId && task.assignedUser !== null;
    });
  };
}

export default OtherPeopleTasksFilterProvider;
