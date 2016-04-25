import AbstractSimpleMigration from './AbstractSimpleMigration';

class ProjectTimerMapping extends AbstractSimpleMigration {
  constructor(host, port, database, status, logger) {
    super(host, port, database, status, logger);
  }

  migrateTimer(timer, task, project) {
    if (task.projectId) {
      timer.projectId = task.projectId;
    }

    return timer;
  }
}

export default ProjectTimerMapping;
