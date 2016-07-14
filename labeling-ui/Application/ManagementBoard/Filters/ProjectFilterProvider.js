function ProjectFilterProvider() {
  return function projectFilter(tasks, projectId) {
    if (!tasks) {
      return [];
    }
    if (!projectId) {
      return tasks;
    }

    return tasks.filter(task => {
      return task.projectId === projectId;
    });
  };
}

export default ProjectFilterProvider;
